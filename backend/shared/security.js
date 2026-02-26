/**
 * Shared backend security helpers (reference implementation).
 *
 * This file exists to mirror the structure referenced in `sudan.md`:
 *   backend/shared/security.js
 *
 * Note: each backend microservice in this repo is built as an isolated Docker context
 * (see `docker-compose.yml` build contexts). If you want services to import this file
 * at runtime, either:
 * - vendor/copy this module into each service, or
 * - change service build contexts to include `backend/shared/`.
 */

const crypto = require('crypto');

function getBearerToken(req) {
  const header = req?.headers?.authorization || req?.headers?.Authorization;
  if (!header || typeof header !== 'string') return null;
  const [type, token] = header.split(' ');
  if (!type || type.toLowerCase() !== 'bearer') return null;
  return token || null;
}

function requireApiKey({ headerName = 'x-api-key', envName = 'API_KEY' } = {}) {
  return (req, res, next) => {
    const expected = process.env[envName];
    if (!expected) return next(); // allow-by-default in local/dev
    const provided = req.headers[headerName];
    if (typeof provided !== 'string') return res.status(401).json({ error: 'API key required' });
    const ok = constantTimeEqual(provided, expected);
    if (!ok) return res.status(403).json({ error: 'Invalid API key' });
    return next();
  };
}

function constantTimeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function hmacSha256(value, secret) {
  return crypto.createHmac('sha256', String(secret)).update(String(value)).digest('hex');
}

function redact(value, visible = 4) {
  const s = String(value);
  if (s.length <= visible) return '*'.repeat(s.length);
  return `${'*'.repeat(Math.max(0, s.length - visible))}${s.slice(-visible)}`;
}

module.exports = {
  getBearerToken,
  requireApiKey,
  constantTimeEqual,
  hmacSha256,
  redact,
};

