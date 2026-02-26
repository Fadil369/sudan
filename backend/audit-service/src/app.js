/**
 * SGDUS Audit Service
 * Immutable audit logging for compliance and traceability.
 *
 * Storage: PostgreSQL (audit_logs table in database/init.sql)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ==================== CONFIG ====================
const CONFIG = {
  port: parseInt(process.env.PORT || '3004', 10),
  postgres: process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: false }
    : {
        host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || process.env.DB_NAME || 'sudan_identity',
        user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres',
      },
};

// ==================== LOGGER ====================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

// ==================== DATABASE ====================
const pool = new Pool(CONFIG.postgres);

pool
  .query('SELECT NOW()')
  .then(() => logger.info('Connected to PostgreSQL'))
  .catch((err) => logger.error('PostgreSQL connection error', { error: err.message }));

// ==================== EXPRESS ====================
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

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

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
}

// ==================== ROUTES ====================

// Write audit entry
app.post('/api/v1/audit', async (req, res) => {
  try {
    const body = req.body || {};
    const event = typeof body.event === 'string' ? body.event.trim() : '';
    if (!event) {
      return res.status(400).json({ success: false, error: 'event is required', requestId: req.requestId });
    }

    const userOid = body.userOid ? `${body.userOid}`.trim() : null;
    const entityOid = body.entityOid ? `${body.entityOid}`.trim() : null;
    const entityType = body.entityType ? `${body.entityType}`.trim() : null;

    const ipAddress = body.ipAddress || body?.metadata?.ipAddress || getClientIp(req);
    const userAgent = body.userAgent || req.get('User-Agent') || null;

    const oldValue = body.oldValue === undefined ? null : JSON.stringify(body.oldValue);
    const newValue = body.newValue === undefined ? null : JSON.stringify(body.newValue);

    const result = await pool.query(
      `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, old_value, new_value, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW())
       RETURNING id, event, user_oid, entity_oid, entity_type, created_at`,
      [event, userOid, entityOid, entityType, oldValue, newValue, ipAddress, userAgent]
    );

    return res.status(201).json({ success: true, data: result.rows[0], requestId: req.requestId });
  } catch (err) {
    logger.error('Audit insert failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
  }
});

// Search audit entries
app.get('/api/v1/audit/search', async (req, res) => {
  try {
    const params = [];
    let index = 1;

    let sql = `
      SELECT id, event, user_oid, entity_oid, entity_type, old_value, new_value, ip_address, user_agent, created_at
      FROM audit_logs
      WHERE 1=1
    `;

    if (req.query.event) {
      sql += ` AND event = $${index++}`;
      params.push(`${req.query.event}`.trim());
    }

    if (req.query.userOid) {
      sql += ` AND user_oid = $${index++}`;
      params.push(`${req.query.userOid}`.trim());
    }

    if (req.query.entityOid) {
      sql += ` AND entity_oid = $${index++}`;
      params.push(`${req.query.entityOid}`.trim());
    }

    if (req.query.entityType) {
      sql += ` AND entity_type = $${index++}`;
      params.push(`${req.query.entityType}`.trim());
    }

    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;
    const offset = req.query.offset ? parseInt(`${req.query.offset}`, 10) || 0 : 0;

    sql += ` ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows, requestId: req.requestId });
  } catch (err) {
    logger.error('Audit search failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
  }
});

// Health
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'audit-service', timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// ==================== START ====================
app.listen(CONFIG.port, () => {
  logger.info(`Audit Service running on port ${CONFIG.port}`);
});

module.exports = app;

