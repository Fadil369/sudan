/**
 * SGDUS Access Control & RBAC Engine (MVP)
 * - /api/v1/access/check
 * - /api/v1/access/adaptive-check
 * - /api/v1/access/assign-role
 * - /api/v1/access/revoke-role
 * - /api/v1/access/create-role
 * - /api/v1/access/stats
 * - /api/v1/access/roles/:userOid
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
require('dotenv').config();

const CONFIG = {
  port: parseInt(process.env.PORT || '3017', 10),
  postgres: process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: false }
    : {
        host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || process.env.DB_NAME || 'sudan_identity',
        user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres',
      },
  adaptiveDenyThreshold: Math.max(3, Math.min(parseInt(process.env.ACCESS_ADAPTIVE_DENY_THRESHOLD || '10', 10) || 10, 1000)),
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

const pool = new Pool(CONFIG.postgres);
pool
  .query('SELECT NOW()')
  .then(() => logger.info('Connected to PostgreSQL'))
  .catch((err) => logger.error('PostgreSQL connection error', { error: err.message }));

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, res, next) => {
  const requestId = req.header('X-Request-ID') || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

function nowIso() {
  return new Date().toISOString();
}

function normalizePermissionKey(resource, action) {
  return `${resource}:${action}`.toLowerCase();
}

function permissionMatches(permission, resource, action) {
  const key = normalizePermissionKey(resource, action);
  const p = `${permission}`.toLowerCase();
  if (p === key) return true;
  if (p === `${resource}:*`.toLowerCase()) return true;
  if (p === `*:${action}`.toLowerCase()) return true;
  if (p === '*:*') return true;
  return false;
}

async function getRole(roleName) {
  const result = await pool.query(`SELECT role_name, role_config FROM access_roles WHERE role_name = $1`, [roleName]);
  return result.rows[0] || null;
}

async function getUserRoles(userOid) {
  const result = await pool.query(
    `SELECT role_name
     FROM user_roles
     WHERE user_oid = $1 AND revoked_at IS NULL
     ORDER BY assigned_at DESC`,
    [userOid]
  );
  return result.rows.map((r) => r.role_name);
}

async function logAccess({ userOid, resource, action, granted, reason, context }) {
  await pool.query(
    `INSERT INTO access_logs (id, user_oid, resource, action, granted, reason, context, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
    [uuidv4(), userOid, resource, action, !!granted, reason || null, JSON.stringify(context || {})]
  );
}

async function checkAccess(userOid, resource, action, context) {
  const roles = await getUserRoles(userOid);
  if (roles.length === 0) {
    return { allowed: false, reason: 'No roles assigned', roles: [] };
  }

  const permissions = [];
  for (const roleName of roles) {
    const role = await getRole(roleName);
    const rolePerms = role?.role_config?.permissions;
    if (Array.isArray(rolePerms)) permissions.push(...rolePerms);
  }

  const allowed = permissions.some((p) => permissionMatches(p, resource, action));
  return { allowed, reason: allowed ? 'Allowed' : 'Permission denied', roles, permissions: allowed ? permissions : undefined };
}

async function recentActivity(userOid) {
  const result = await pool.query(
    `SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN granted = false THEN 1 END)::int as denied
     FROM access_logs
     WHERE user_oid = $1
       AND timestamp >= NOW() - INTERVAL '24 hours'`,
    [userOid]
  );
  return result.rows[0] || { total: 0, denied: 0 };
}

// ==================== ROUTES ====================

app.post('/api/v1/access/check', async (req, res) => {
  try {
    const { userOid, resource, action, context } = req.body || {};
    if (!userOid || !resource || !action) {
      return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    }

    const result = await checkAccess(`${userOid}`.trim(), `${resource}`.trim(), `${action}`.trim(), context || {});
    await logAccess({ userOid: `${userOid}`.trim(), resource: `${resource}`.trim(), action: `${action}`.trim(), granted: result.allowed, reason: result.reason, context: context || {} });

    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Access check error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Access check failed', requestId: req.requestId });
  }
});

app.post('/api/v1/access/adaptive-check', async (req, res) => {
  try {
    const { userOid, resource, action, context } = req.body || {};
    if (!userOid || !resource || !action) {
      return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    }

    const base = await checkAccess(`${userOid}`.trim(), `${resource}`.trim(), `${action}`.trim(), context || {});
    const activity = await recentActivity(`${userOid}`.trim());
    const excessive = activity.denied >= CONFIG.adaptiveDenyThreshold;

    const result = excessive
      ? { allowed: false, reason: 'Adaptive security: excessive denied attempts', roles: base.roles, activity }
      : { ...base, activity };

    await logAccess({
      userOid: `${userOid}`.trim(),
      resource: `${resource}`.trim(),
      action: `${action}`.trim(),
      granted: result.allowed,
      reason: result.reason,
      context: { ...(context || {}), adaptive: true, activity },
    });

    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Adaptive check error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Adaptive check failed', requestId: req.requestId });
  }
});

app.post('/api/v1/access/assign-role', async (req, res) => {
  try {
    const { userOid, role, assignedBy } = req.body || {};
    if (!userOid || !role || !assignedBy) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    await pool.query(
      `INSERT INTO user_roles (user_oid, role_name, assigned_by, assigned_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_oid, role_name)
       DO UPDATE SET revoked_at = NULL, assigned_by = EXCLUDED.assigned_by, assigned_at = NOW()`,
      [`${userOid}`.trim(), `${role}`.trim(), `${assignedBy}`.trim()]
    );

    return res.json({ success: true, userOid, role, assignedBy, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Role assignment error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/access/revoke-role', async (req, res) => {
  try {
    const { userOid, role, revokedBy } = req.body || {};
    if (!userOid || !role || !revokedBy) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    await pool.query(
      `UPDATE user_roles
       SET revoked_at = NOW(), revoked_by = $3
       WHERE user_oid = $1 AND role_name = $2 AND revoked_at IS NULL`,
      [`${userOid}`.trim(), `${role}`.trim(), `${revokedBy}`.trim()]
    );

    return res.json({ success: true, userOid, role, revokedBy, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Role revocation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/access/create-role', async (req, res) => {
  try {
    const { roleConfig } = req.body || {};
    if (!roleConfig || typeof roleConfig !== 'object') return res.status(400).json({ error: 'Missing roleConfig', requestId: req.requestId });
    const roleName = `${roleConfig.roleName || roleConfig.name || ''}`.trim();
    if (!roleName) return res.status(400).json({ error: 'roleName is required', requestId: req.requestId });

    const permissions = Array.isArray(roleConfig.permissions) ? roleConfig.permissions : [];
    const normalized = { ...roleConfig, roleName, permissions };

    await pool.query(
      `INSERT INTO access_roles (role_name, role_config, created_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (role_name)
       DO UPDATE SET role_config = EXCLUDED.role_config`,
      [roleName, JSON.stringify(normalized)]
    );

    return res.json({ success: true, roleName, roleConfig: normalized, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Role creation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/access/stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)::int as total_checks,
        COUNT(CASE WHEN granted = true THEN 1 END)::int as granted,
        COUNT(CASE WHEN granted = false THEN 1 END)::int as denied,
        MAX(timestamp) as last_check
       FROM access_logs
       WHERE timestamp >= NOW() - INTERVAL '30 days'`
    );

    return res.json({ success: true, stats: result.rows[0], timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Stats error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get stats', requestId: req.requestId });
  }
});

app.get('/api/v1/access/roles/:userOid', async (req, res) => {
  try {
    const userOid = `${req.params.userOid}`.trim();
    const roles = await getUserRoles(userOid);
    return res.json({ success: true, userOid, roles, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Get roles error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get roles', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const roleCount = await pool.query(`SELECT COUNT(*)::int as count FROM access_roles`);
    return res.json({
      status: 'healthy',
      service: 'access-control-engine',
      timestamp: nowIso(),
      version: 'mvp-1.0.0',
      roles: roleCount.rows[0]?.count || 0,
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Access Control Engine running on port ${CONFIG.port}`);
});

module.exports = app;

