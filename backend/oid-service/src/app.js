/**
 * SGDUS OID Service
 * OID generation, registration, resolution and search.
 *
 * Default OID root: 1.3.6.1.4.1.61026
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const CONFIG = {
  port: process.env.PORT || 3002,
  oidRoot: process.env.OID_ROOT || '1.3.6.1.4.1.61026',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  postgres: process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: false }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'sgdus',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
      },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
};

// ==================== LOGGER ====================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

// ==================== DATABASE ====================
const pool = new Pool(CONFIG.postgres);

pool.query('SELECT NOW()')
  .then(() => logger.info('Connected to PostgreSQL'))
  .catch((err) => logger.error('PostgreSQL connection error', { error: err.message }));

// ==================== REDIS ====================
let redisClient;
(async () => {
  try {
    redisClient = createClient({ url: CONFIG.redis.url });
    redisClient.on('error', (err) => logger.error('Redis client error', { error: err.message }));
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (err) {
    logger.error('Redis connection error', { error: err.message });
  }
})();

// ==================== EXPRESS APP ====================
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

// Correlation ID + request context
app.use((req, res, next) => {
  const requestId = req.header('X-Request-ID') || uuidv4();
  res.setHeader('X-Request-ID', requestId);
  req.requestId = requestId;
  next();
});

// Rate limiting (global)
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(globalLimiter);

// More strict limiter for OID generation
const oidLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many OID generation requests, please try again later.',
});

// ==================== HELPERS ====================
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return next();
}

function normalizeType(type) {
  const parsed = typeof type === 'string' ? parseInt(type, 10) : type;
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 6) {
    const err = new Error('Invalid OID type (must be 1-6)');
    err.statusCode = 400;
    throw err;
  }
  return parsed;
}

function normalizeStateCode(stateCode) {
  const raw = `${stateCode}`.trim();
  if (!/^\d{1,2}$/.test(raw)) {
    const err = new Error('State code must be 1-2 digits');
    err.statusCode = 400;
    throw err;
  }

  const padded = raw.padStart(2, '0');
  if (padded === '00') return padded;

  const numeric = parseInt(padded, 10);
  if (numeric < 1 || numeric > 18) {
    const err = new Error('Invalid Sudanese state code (00 or 01-18)');
    err.statusCode = 400;
    throw err;
  }
  return padded;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateOidFormat(oid) {
  // We accept any numeric arcs under the configured root; generation uses a strict root.type.state.counter shape.
  const rootEscaped = escapeRegExp(CONFIG.oidRoot);
  const pattern = new RegExp(`^${rootEscaped}(?:\\.\\d+)+$`);
  return pattern.test(oid);
}

async function redisGet(key) {
  try {
    if (!redisClient || !redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch (err) {
    logger.warn('Redis GET failed', { key, error: err.message });
    return null;
  }
}

async function redisSetEx(key, ttlSeconds, value) {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (err) {
    logger.warn('Redis SETEX failed', { key, error: err.message });
  }
}

async function redisDel(keys) {
  try {
    if (!redisClient || !redisClient.isOpen) return;
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length === 0) return;
    await redisClient.del(list);
  } catch (err) {
    logger.warn('Redis DEL failed', { error: err.message });
  }
}

async function findExistingOid({ type, stateCode, entityId }) {
  const result = await pool.query(
    `SELECT oid, type, state_code, entity_id, metadata, created_at, updated_at, status
     FROM oid_registry
     WHERE type = $1 AND state_code = $2 AND entity_id = $3
     ORDER BY created_at DESC
     LIMIT 1`,
    [type, stateCode, entityId]
  );
  return result.rows[0] || null;
}

async function createOidRecord({ type, stateCode, entityId, metadata }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const counterResult = await client.query(
      `INSERT INTO oid_counters (type, state_code, counter)
       VALUES ($1, $2, 1)
       ON CONFLICT (type, state_code)
       DO UPDATE SET counter = oid_counters.counter + 1, updated_at = CURRENT_TIMESTAMP
       RETURNING counter`,
      [type, stateCode]
    );

    const counter = counterResult.rows[0].counter;
    const oid = `${CONFIG.oidRoot}.${type}.${stateCode}.${String(counter).padStart(8, '0')}`;

    const registryResult = await client.query(
      `INSERT INTO oid_registry (oid, type, state_code, entity_id, metadata, status)
       VALUES ($1, $2, $3, $4, $5::jsonb, 'active')
       RETURNING oid, type, state_code, entity_id, metadata, created_at, updated_at, status`,
      [oid, type, stateCode, entityId, JSON.stringify(metadata ?? {})]
    );

    await client.query('COMMIT');

    return registryResult.rows[0];
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw err;
  } finally {
    client.release();
  }
}

async function ensureOid({ type, stateCode, entityId, metadata }) {
  const cacheKey = `oid:${type}:${stateCode}:${entityId}`;

  const cached = await redisGet(cacheKey);
  if (cached) {
    return { oid: cached, source: 'cache' };
  }

  const existing = await findExistingOid({ type, stateCode, entityId });
  if (existing) {
    await redisSetEx(cacheKey, CONFIG.cacheTtlSeconds, existing.oid);
    await redisSetEx(`oid:resolve:${existing.oid}`, CONFIG.cacheTtlSeconds, JSON.stringify(existing));
    return { oid: existing.oid, source: 'db' };
  }

  try {
    const created = await createOidRecord({ type, stateCode, entityId, metadata });
    await redisSetEx(cacheKey, CONFIG.cacheTtlSeconds, created.oid);
    await redisSetEx(`oid:resolve:${created.oid}`, CONFIG.cacheTtlSeconds, JSON.stringify(created));
    logger.info('OID generated', { oid: created.oid, type, stateCode, entityId });
    return { oid: created.oid, source: 'new' };
  } catch (err) {
    // If another request created it concurrently, return the existing entry.
    if (err && err.code === '23505') {
      const concurrent = await findExistingOid({ type, stateCode, entityId });
      if (concurrent) {
        await redisSetEx(cacheKey, CONFIG.cacheTtlSeconds, concurrent.oid);
        await redisSetEx(`oid:resolve:${concurrent.oid}`, CONFIG.cacheTtlSeconds, JSON.stringify(concurrent));
        return { oid: concurrent.oid, source: 'db-race' };
      }
    }
    throw err;
  }
}

// ==================== ROUTES ====================

// Generate/register an OID (idempotent for type+stateCode+entityId)
const generateValidators = [
  body('type').notEmpty().withMessage('type is required'),
  body('stateCode').notEmpty().withMessage('stateCode is required'),
  body('entityId').isString().notEmpty().withMessage('entityId is required'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
];

app.post('/api/v1/oid/generate', oidLimiter, generateValidators, validateRequest, async (req, res) => {
  try {
    const type = normalizeType(req.body.type);
    const stateCode = normalizeStateCode(req.body.stateCode);
    const entityId = `${req.body.entityId}`.trim();
    const metadata = req.body.metadata ?? {};

    const result = await ensureOid({ type, stateCode, entityId, metadata });

    res.status(result.source === 'new' ? 201 : 200).json({
      success: true,
      oid: result.oid,
      source: result.source,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('OID generation error', { requestId: req.requestId, error: err.message });
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      requestId: req.requestId,
    });
  }
});

// Alias for docs/spec wording
app.post('/api/v1/oid/register', oidLimiter, generateValidators, validateRequest, async (req, res) => {
  try {
    const type = normalizeType(req.body.type);
    const stateCode = normalizeStateCode(req.body.stateCode);
    const entityId = `${req.body.entityId}`.trim();
    const metadata = req.body.metadata ?? {};

    const result = await ensureOid({ type, stateCode, entityId, metadata });

    res.status(result.source === 'new' ? 201 : 200).json({
      success: true,
      oid: result.oid,
      source: result.source,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('OID register error', { requestId: req.requestId, error: err.message });
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Internal server error',
      requestId: req.requestId,
    });
  }
});

// Resolve OID
app.get(
  '/api/v1/oid/:oid',
  [param('oid').isString().notEmpty().withMessage('oid is required')],
  validateRequest,
  async (req, res) => {
    try {
      const oid = req.params.oid;

      if (!validateOidFormat(oid)) {
        return res.status(400).json({ success: false, error: 'Invalid OID format', requestId: req.requestId });
      }

      const cacheKey = `oid:resolve:${oid}`;
      const cached = await redisGet(cacheKey);
      if (cached) {
        return res.json({ success: true, data: JSON.parse(cached), cached: true, requestId: req.requestId });
      }

      const result = await pool.query(
        `SELECT oid, type, state_code, entity_id, metadata, created_at, updated_at, status
         FROM oid_registry
         WHERE oid = $1`,
        [oid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'OID not found', requestId: req.requestId });
      }

      const record = result.rows[0];
      await redisSetEx(cacheKey, CONFIG.cacheTtlSeconds, JSON.stringify(record));

      return res.json({ success: true, data: record, cached: false, requestId: req.requestId });
    } catch (err) {
      logger.error('OID resolution error', { requestId: req.requestId, error: err.message });
      return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
    }
  }
);

// Metadata only
app.get(
  '/api/v1/oid/:oid/metadata',
  [param('oid').isString().notEmpty().withMessage('oid is required')],
  validateRequest,
  async (req, res) => {
    try {
      const oid = req.params.oid;
      if (!validateOidFormat(oid)) {
        return res.status(400).json({ success: false, error: 'Invalid OID format', requestId: req.requestId });
      }

      const result = await pool.query(`SELECT oid, metadata, status, updated_at FROM oid_registry WHERE oid = $1`, [oid]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'OID not found', requestId: req.requestId });
      }

      return res.json({ success: true, data: result.rows[0], requestId: req.requestId });
    } catch (err) {
      logger.error('OID metadata error', { requestId: req.requestId, error: err.message });
      return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
    }
  }
);

// Update OID status
app.put(
  '/api/v1/oid/:oid/status',
  [
    param('oid').isString().notEmpty().withMessage('oid is required'),
    body('status').isIn(['active', 'suspended', 'revoked', 'archived']).withMessage('Invalid status'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const oid = req.params.oid;
      const status = req.body.status;

      if (!validateOidFormat(oid)) {
        return res.status(400).json({ success: false, error: 'Invalid OID format', requestId: req.requestId });
      }

      const updated = await pool.query(
        `UPDATE oid_registry
         SET status = $2, updated_at = NOW()
         WHERE oid = $1
         RETURNING oid, type, state_code, entity_id, metadata, created_at, updated_at, status`,
        [oid, status]
      );

      if (updated.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'OID not found', requestId: req.requestId });
      }

      const record = updated.rows[0];

      // Invalidate caches
      await redisDel([
        `oid:resolve:${oid}`,
        `oid:${record.type}:${record.state_code}:${record.entity_id}`,
      ]);

      return res.json({ success: true, data: record, requestId: req.requestId });
    } catch (err) {
      logger.error('OID status update error', { requestId: req.requestId, error: err.message });
      return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
    }
  }
);

// Search OIDs
app.get(
  '/api/v1/oid/search',
  [
    query('type').optional().isInt({ min: 1, max: 6 }),
    query('stateCode').optional().matches(/^\d{1,2}$/),
    query('status').optional().isIn(['active', 'suspended', 'revoked', 'archived']),
    query('entityId').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const params = [];
      let index = 1;

      let sql = `
        SELECT oid, type, state_code, entity_id, created_at, updated_at, status, metadata
        FROM oid_registry
        WHERE 1=1
      `;

      if (req.query.type) {
        sql += ` AND type = $${index++}`;
        params.push(parseInt(req.query.type, 10));
      }

      if (req.query.stateCode) {
        const normalizedState = normalizeStateCode(req.query.stateCode);
        sql += ` AND state_code = $${index++}`;
        params.push(normalizedState);
      }

      if (req.query.status) {
        sql += ` AND status = $${index++}`;
        params.push(req.query.status);
      }

      if (req.query.entityId) {
        sql += ` AND entity_id = $${index++}`;
        params.push(req.query.entityId);
      }

      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

      sql += ` ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index++}`;
      params.push(limit, offset);

      const result = await pool.query(sql, params);
      return res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        requestId: req.requestId,
      });
    } catch (err) {
      logger.error('OID search error', { requestId: req.requestId, error: err.message });
      return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
    }
  }
);

// Initialize/seed counters (dev/admin)
app.post(
  '/api/v1/oid/initialize',
  [
    body('seeds').optional().isArray(),
    body('type').optional(),
    body('stateCode').optional(),
    body('counter').optional().isInt({ min: 1 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const seeds = Array.isArray(req.body.seeds)
        ? req.body.seeds
        : [{ type: req.body.type, stateCode: req.body.stateCode, counter: req.body.counter }];

      const applied = [];
      for (const seed of seeds) {
        const type = normalizeType(seed.type);
        const stateCode = normalizeStateCode(seed.stateCode);
        const counter = parseInt(seed.counter || '1', 10);
        if (!Number.isInteger(counter) || counter < 1) {
          return res.status(400).json({ success: false, error: 'counter must be >= 1', requestId: req.requestId });
        }

        const result = await pool.query(
          `INSERT INTO oid_counters (type, state_code, counter)
           VALUES ($1, $2, $3)
           ON CONFLICT (type, state_code)
           DO UPDATE SET counter = EXCLUDED.counter, updated_at = CURRENT_TIMESTAMP
           RETURNING type, state_code, counter`,
          [type, stateCode, counter]
        );

        applied.push(result.rows[0]);
      }

      return res.json({ success: true, applied, requestId: req.requestId });
    } catch (err) {
      logger.error('OID initialize error', { requestId: req.requestId, error: err.message });
      return res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
    }
  }
);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    if (redisClient && redisClient.isOpen) await redisClient.ping();
    res.json({
      status: 'healthy',
      service: 'oid-service',
      timestamp: new Date().toISOString(),
      oidRoot: CONFIG.oidRoot,
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { requestId: req.requestId, error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error', requestId: req.requestId });
});

// ==================== START SERVER ====================
app.listen(CONFIG.port, () => {
  logger.info(`OID Service running on port ${CONFIG.port}`);
  logger.info(`OID Root: ${CONFIG.oidRoot}`);
});

module.exports = app;
