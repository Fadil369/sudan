import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

function base64UrlEncode(value) {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createJwt(payload = {}) {
  const tokenPayload = {
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: 'citizen',
    ...payload,
  };

  return `${base64UrlEncode({ alg: 'HS256', typ: 'JWT' })}.${base64UrlEncode(tokenPayload)}.signature`;
}

async function loadAuthService(env = {}) {
  vi.resetModules();
  vi.unstubAllEnvs();

  vi.stubEnv('VITE_JWT_SECRET', 'test-jwt-secret');

  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });

  return (await import('../security/AuthService.js')).default;
}

describe('AuthService', () => {
  beforeEach(() => {
    global.fetch.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('logs in against the direct identity API and persists session state', async () => {
    const authService = await loadAuthService({
      VITE_AUTH_PROVIDER: 'identity-service',
      VITE_API_BASE_URL: 'http://localhost:8000/api',
    });

    const token = createJwt({ oid: '1.3.6.1.4.1.61026.2.01.00000001', nationalId: '123456789' });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token,
        citizen: {
          oid: '1.3.6.1.4.1.61026.2.01.00000001',
          nationalId: '123456789',
        },
      }),
    });

    const result = await authService.login({ oid: '1.3.6.1.4.1.61026.2.01.00000001', password: 'Secret123!' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/identity/login',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({ id: '1.3.6.1.4.1.61026.2.01.00000001', role: 'citizen' }),
      })
    );

    const stored = JSON.parse(sessionStorage.getItem('_session_state'));
    expect(stored).toEqual(
      expect.objectContaining({
        authBackend: 'identity-service',
        userId: '1.3.6.1.4.1.61026.2.01.00000001',
        nationalId: '123456789',
      })
    );
  });

  it('refreshes direct identity sessions via the identity profile endpoint', async () => {
    const authService = await loadAuthService({
      VITE_AUTH_PROVIDER: 'identity-service',
      VITE_API_BASE_URL: 'http://localhost:8000/api',
    });

    const token = createJwt({ oid: '1.3.6.1.4.1.61026.2.01.00000002', exp: Math.floor(Date.now() / 1000) + 7200 });
    sessionStorage.setItem('_session_state', JSON.stringify({ token, exp: 0 }));
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ profile: { oid: '1.3.6.1.4.1.61026.2.01.00000002' } }) });

    const result = await authService.refreshTokens(token);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/identity/profile',
      expect.objectContaining({ headers: { Authorization: `Bearer ${token}` } })
    );
    expect(result).toEqual({ success: true, tokens: { accessToken: token, refreshToken: token } });
    expect(JSON.parse(sessionStorage.getItem('_session_state')).exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('logs out direct identity sessions without calling the worker logout endpoint', async () => {
    const authService = await loadAuthService({
      VITE_AUTH_PROVIDER: 'identity-service',
      VITE_API_BASE_URL: 'http://localhost:8000/api',
    });

    sessionStorage.setItem('_session_state', JSON.stringify({ token: 'direct-token', exp: Math.floor(Date.now() / 1000) + 3600 }));
    await authService.logout({ accessToken: 'direct-token' });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(() => authService.verifyToken('direct-token')).toThrow('Token has been revoked');
  });

  it('uses the worker login flow when configured for worker auth', async () => {
    const authService = await loadAuthService({
      VITE_AUTH_PROVIDER: 'worker',
      VITE_API_BASE_URL: '/api',
    });

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'worker-token', expiresAt: new Date(Date.now() + 3600_000).toISOString() }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: 'worker-user',
          profile: { role: 'government_official', permissions: ['approve'], ministry_id: 'health' },
        }),
      });

    const result = await authService.login({ username: 'worker-user', password: 'Secret123!' });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      '/api/user/profile',
      expect.objectContaining({ headers: { Authorization: 'Bearer worker-token' } })
    );
    expect(result.user).toEqual(
      expect.objectContaining({
        id: 'worker-user',
        role: 'government_official',
        permissions: ['approve'],
        ministryId: 'health',
      })
    );
  });

  it('refreshes worker sessions and updates the cached expiry', async () => {
    const authService = await loadAuthService({
      VITE_AUTH_PROVIDER: 'worker',
      VITE_API_BASE_URL: '/api',
    });

    sessionStorage.setItem('_session_state', JSON.stringify({ token: 'worker-token', exp: 0 }));
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { expiresAt: new Date(Date.now() + 5400_000).toISOString() } }),
    });

    const result = await authService.refreshTokens('worker-token');

    expect(result).toEqual({ success: true, tokens: { accessToken: 'worker-token', refreshToken: 'worker-token' } });
    expect(JSON.parse(sessionStorage.getItem('_session_state')).exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('verifies locally generated JWTs and exposes permission helpers', async () => {
    const authService = await loadAuthService({ VITE_AUTH_PROVIDER: 'worker' });

    const token = authService.generateToken({
      id: 'local-user',
      email: 'local@example.com',
      role: 'citizen',
      department: 'identity',
      permissions: ['read'],
    });

    const decoded = authService.verifyToken(token);

    expect(decoded).toEqual(expect.objectContaining({ id: 'local-user', role: 'citizen' }));
    expect(authService.generateRefreshToken({ id: 'local-user' })).toContain('.');
    expect(authService.checkPermission('government_official', 'approve')).toBe(true);
    expect(authService.checkPermission('guest', 'write')).toBe(false);
    expect(authService.validateSudanNationalId('123456789')).toBe(true);
    expect(authService.validateSudanNationalId('ABC')).toBe(false);
    expect(authService.sanitizeUserData({ id: 'user', password: 'secret', otp: '123456', role: 'citizen' })).toEqual({ id: 'user', role: 'citizen' });
  });

  it('handles password hashing, OTP validation, role hierarchy, and cached session expiry', async () => {
    const authService = await loadAuthService({ VITE_AUTH_PROVIDER: 'worker' });

    const hashedPassword = await authService.hashPassword('Secret123!');
    expect(await authService.verifyPassword('Secret123!', hashedPassword)).toBe(true);
    expect(await authService.verifyPassword('wrong-pass', hashedPassword)).toBe(false);

    const otp = authService.generateOTP();
    expect(otp).toHaveLength(6);
    expect(authService.validateOTP(otp, otp, Date.now() - 1000)).toEqual({ valid: true });
    expect(authService.validateOTP('000000', otp, Date.now() - 1000)).toEqual({ valid: false, reason: 'Invalid OTP' });
    expect(authService.validateOTP(otp, otp, Date.now() - 301000)).toEqual({ valid: false, reason: 'OTP expired' });
    expect(authService.constructor.hasPermission(['read', 'write'], 'write')).toBe(true);
    expect(authService.constructor.hasPermission(['read'], 'approve')).toBe(false);
    expect(authService.constructor.hasRoleLevel('ministry_admin', 'citizen')).toBe(true);
    expect(authService.constructor.hasRoleLevel('guest', 'official')).toBe(false);

    sessionStorage.setItem('_session_state', JSON.stringify({ token: 'expired-token', exp: Math.floor(Date.now() / 1000) - 1 }));
    expect(() => authService.verifyToken('expired-token')).toThrow('Session expired');
  }, 15000);
});