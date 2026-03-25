// Browser-compatible JWT library alternative
import CryptoJS from 'crypto-js';

// Simple base64 URL encoding for browser
function base64UrlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlEncode(str) {
  return base64UrlEscape(btoa(str));
}

function base64UrlDecode(str) {
  str += new Array(5 - str.length % 4).join('=');
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Simple JWT implementation for browser
class BrowserJWT {
  static sign(payload, secret, options = {}) {
    const header = {
      typ: 'JWT',
      alg: 'HS256'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + (options.expiresIn ? this.parseExpiry(options.expiresIn) : 86400),
      iss: options.issuer || 'sudan-oid-portal',
      aud: options.audience || 'sudan-citizens'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
    
    const signature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, secret);
    const encodedSignature = base64UrlEscape(signature.toString(CryptoJS.enc.Base64));

    return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
  }

  static verify(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      
      // Verify signature
      const signature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, secret);
      const expectedSignature = base64UrlEscape(signature.toString(CryptoJS.enc.Base64));
      
      if (encodedSignature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Token verification failed: ' + error.message);
    }
  }

  static parseExpiry(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;
    if (typeof expiresIn === 'string') {
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (match) {
        const [, num, unit] = match;
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        return parseInt(num) * multipliers[unit];
      }
    }
    return 86400; // Default 24 hours
  }
}

class AuthService {
  constructor() {
    // Never fall back to a hardcoded secret — generate a random ephemeral key for dev (OWASP A02)
    if (!process.env.REACT_APP_JWT_SECRET) {
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      this.JWT_SECRET = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
      if (typeof window !== 'undefined') {
        console.warn('[SECURITY] REACT_APP_JWT_SECRET not set — using ephemeral dev key. Set this env var in production.');
      }
    } else {
      this.JWT_SECRET = process.env.REACT_APP_JWT_SECRET;
    }
    this.JWT_EXPIRES_IN = process.env.REACT_APP_JWT_EXPIRES_IN || '24h';
    this.REFRESH_EXPIRES_IN = process.env.REACT_APP_REFRESH_EXPIRES_IN || '7d';
    // Fallback in-memory set only when sessionStorage is unavailable
    this.tokenBlacklist = new Set();
  }

  // ─── Token Blacklist (sessionStorage-backed) ────────────────────────────────

  blacklistToken(token) {
    try {
      const raw = sessionStorage.getItem('_token_blacklist') || '[]';
      const list = JSON.parse(raw);
      list.push({ token, expiry: Date.now() + 24 * 3600 * 1000 });
      const pruned = list.filter((e) => e.expiry > Date.now());
      sessionStorage.setItem('_token_blacklist', JSON.stringify(pruned));
    } catch (_) {
      this.tokenBlacklist.add(token);
      setTimeout(() => this.tokenBlacklist.delete(token), 24 * 3600 * 1000);
    }
    // Remove session state so subsequent verifyToken calls fail immediately
    try { sessionStorage.removeItem('_session_state'); } catch (_) {}
  }

  _isBlacklisted(token) {
    if (this.tokenBlacklist.has(token)) return true;
    try {
      const list = JSON.parse(sessionStorage.getItem('_token_blacklist') || '[]');
      return list.some((e) => e.token === token && e.expiry > Date.now());
    } catch (_) {
      return false;
    }
  }

  // ─── Core Auth — login / logout / refreshTokens ─────────────────────────────

  _getApiUrl() {
    try {
      // Vite injects VITE_* vars at build time via import.meta.env
      // eslint-disable-next-line no-undef
      return import.meta.env.VITE_API_BASE_URL || '/api';
    } catch (_) {
      return '/api';
    }
  }

  /**
   * Authenticate against the Cloudflare Worker.
   * Supports password credentials and biometric (WebAuthn credential ID).
   * Returns { success, user, tokens } compatible with AuthProvider.
   */
  async login(credentials) {
    const apiUrl = this._getApiUrl();
    let workerToken, expiresAt;

    if (credentials.biometric) {
      const res = await fetch(`${apiUrl}/auth/biometric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: credentials.credentialId || null }),
      });
      if (!res.ok) throw new Error('Biometric authentication failed');
      const data = await res.json();
      workerToken = data.token;
      expiresAt = data.expiresAt;
    } else {
      if (!credentials.oid && !credentials.username) throw new Error('OID or username required');
      if (!credentials.password) throw new Error('Password required');
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.oid || credentials.username,
          password: credentials.password,
        }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      workerToken = data.token;
      expiresAt = data.expiresAt;
    }

    // Fetch user profile using the Worker session token (best-effort)
    let profileData = null;
    try {
      const profileRes = await fetch(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${workerToken}` },
      });
      if (profileRes.ok) profileData = await profileRes.json();
    } catch (_) {}

    const user = {
      id: profileData?.userId || credentials.oid || credentials.username || 'unknown',
      username: credentials.oid || credentials.username || profileData?.userId,
      role: profileData?.profile?.role || 'citizen',
      permissions: profileData?.profile?.permissions || [],
      ministryId: profileData?.profile?.ministry_id || null,
    };

    const expTimestamp = expiresAt
      ? Math.floor(new Date(expiresAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 28800;

    // Persist session state so verifyToken() can reconstruct the user payload
    try {
      sessionStorage.setItem(
        '_session_state',
        JSON.stringify({
          token: workerToken,
          userId: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions,
          ministryId: user.ministryId,
          exp: expTimestamp,
        })
      );
    } catch (_) {}

    return {
      success: true,
      user,
      // accessToken = Worker UUID  (sent as Bearer to Worker APIs)
      // refreshToken = same UUID  (used to refresh the session check)
      tokens: { accessToken: workerToken, refreshToken: workerToken },
    };
  }

  /**
   * Invalidate session on the Worker and clear local state.
   */
  async logout(tokens) {
    const token = tokens?.accessToken || tokens?.refreshToken;
    if (token) {
      this.blacklistToken(token);
      try {
        const apiUrl = this._getApiUrl();
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
      } catch (_) {}
    }
    try { sessionStorage.removeItem('_session_state'); } catch (_) {}
  }

  /**
   * Validate an active session by checking the Worker profile endpoint.
   * Returns { success, tokens } so AuthProvider can update its state.
   */
  async refreshTokens(refreshToken) {
    if (!refreshToken) throw new Error('No refresh token provided');
    const apiUrl = this._getApiUrl();
    const profileRes = await fetch(`${apiUrl}/user/profile`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (!profileRes.ok) throw new Error('Session expired or invalid');
    const profileData = await profileRes.json();

    const expTimestamp = profileData.session?.expiresAt
      ? Math.floor(new Date(profileData.session.expiresAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 28800;

    try {
      const stored = JSON.parse(sessionStorage.getItem('_session_state') || '{}');
      stored.exp = expTimestamp;
      sessionStorage.setItem('_session_state', JSON.stringify(stored));
    } catch (_) {}

    return { success: true, tokens: { accessToken: refreshToken, refreshToken } };
  }

  // ─── Token Verification ──────────────────────────────────────────────────────

  /**
   * Verify a session token.
   * Worker tokens are UUIDs — we look them up in cached session state.
   * Falls back to BrowserJWT for legacy/local tokens.
   * Returns the decoded payload or throws.
   */
  verifyToken(token) {
    if (!token) throw new Error('No token provided');
    if (this._isBlacklisted(token)) throw new Error('Token has been revoked');

    // Primary: check cached session state (set during login/refreshTokens)
    try {
      const stateStr = sessionStorage.getItem('_session_state');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.token === token) {
          if (state.exp < Math.floor(Date.now() / 1000)) {
            sessionStorage.removeItem('_session_state');
            throw new Error('Session expired');
          }
          return {
            userId: state.userId,
            username: state.username,
            role: state.role,
            permissions: state.permissions,
            ministryId: state.ministryId,
            exp: state.exp,
          };
        }
      }
    } catch (e) {
      if (e.message === 'Session expired') throw e;
      // Corrupt sessionStorage entry — fall through
    }

    // Fallback: try decoding as a BrowserJWT (for locally-signed tokens)
    try {
      return BrowserJWT.verify(token, this.JWT_SECRET);
    } catch (_) {}

    throw new Error('Invalid or expired session token');
  }

  // ─── Static Permission / Role Helpers ───────────────────────────────────────

  /**
   * Returns true if the permissions array grants the required permission.
   */
  static hasPermission(permissions, permission) {
    if (!Array.isArray(permissions)) return false;
    return permissions.includes('*') || permissions.includes(permission);
  }

  /**
   * Returns true if userRole is at least as privileged as requiredRole.
   */
  static hasRoleLevel(userRole, requiredRole) {
    const HIERARCHY = {
      super_admin: 5,
      ministry_admin: 4,
      department_head: 3,
      official: 2,
      government_official: 2,
      verified_citizen: 1,
      citizen: 1,
      guest: 0,
    };
    return (HIERARCHY[userRole] ?? 0) >= (HIERARCHY[requiredRole] ?? 0);
  }

  // ─── Password Hashing (PBKDF2) ───────────────────────────────────────────────

  async hashPassword(password) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const hash = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 100000 });
    return salt.toString() + ':' + hash.toString();
  }

  async verifyPassword(password, hashedPassword) {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const computedHash = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256 / 32,
        iterations: 100000,
      });
      return computedHash.toString() === hash;
    } catch (_) {
      return false;
    }
  }

  // ─── Token Generation (server-side helpers) ──────────────────────────────────

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions || [],
    };
    return BrowserJWT.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'sudan-oid-portal',
      audience: 'sudan-citizens',
    });
  }

  generateRefreshToken(user) {
    return BrowserJWT.sign({ id: user.id, type: 'refresh' }, this.JWT_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      issuer: 'sudan-oid-portal',
    });
  }

  // ─── RBAC ────────────────────────────────────────────────────────────────────

  checkPermission(userRole, requiredPermission) {
    const rolePermissions = {
      'super_admin': ['*'], // All permissions
      'ministry_admin': ['read', 'write', 'manage_department'],
      'government_official': ['read', 'write', 'approve'],
      'citizen': ['read', 'submit'],
      'guest': ['read']
    };

    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
  }

  // Validate government ID (Sudan National ID format)
  validateSudanNationalId(nationalId) {
    // Sudan National ID format: 9 digits
    const idRegex = /^\d{9}$/;
    return idRegex.test(nationalId);
  }

  // Generate a cryptographically secure 6-digit OTP
  generateOTP() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    // Map to [100000, 999999]
    return String(100000 + (arr[0] % 900000));
  }

  // Validate OTP
  validateOTP(providedOTP, storedOTP, timestamp) {
    const OTP_VALIDITY = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (now - timestamp > OTP_VALIDITY) {
      return { valid: false, reason: 'OTP expired' };
    }

    if (providedOTP !== storedOTP) {
      return { valid: false, reason: 'Invalid OTP' };
    }

    return { valid: true };
  }

  // Secure user session data
  sanitizeUserData(user) {
    const { password, otp, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

const authService = new AuthService();
export default authService;