/**
 * SGDUS Integration Orchestrator (MVP)
 * - /api/v1/integration/execute
 * - /api/v1/integration/orchestrate
 * - /api/v1/integration/health
 * - /api/v1/integration/sync
 * - /api/v1/integration/history
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
  port: parseInt(process.env.PORT || '3018', 10),
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
    max: 1200,
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

async function recordExecution({ integration, action, kind, requestData, responseData, status, errorMessage }) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO integration_executions (id, integration, action, kind, status, request_data, response_data, error_message, started_at, finished_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, NOW(), NOW())`,
    [id, integration, action, kind, status, JSON.stringify(requestData || {}), JSON.stringify(responseData || {}), errorMessage || null]
  );
  return id;
}

const SUPPORTED_INTEGRATIONS = new Map([
  ['civil-registry', { description: 'Birth/death/citizenship registry sync' }],
  ['business-registry', { description: 'Business registration sync' }],
  ['tax-authority', { description: 'Tax ID and compliance sync' }],
  ['customs', { description: 'Export/import permits sync' }],
  ['land-registry', { description: 'Land and property registry sync' }],
]);

// ==================== ROUTES ====================

app.post('/api/v1/integration/execute', async (req, res) => {
  try {
    const { integration, action, data, context } = req.body || {};
    if (!integration || !action || !data) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const result = {
      integration,
      action,
      status: 'completed',
      requestId: req.requestId,
      context: context || {},
      output: { received: true },
    };

    const executionId = await recordExecution({
      integration: `${integration}`.trim(),
      action: `${action}`.trim(),
      kind: 'execute',
      requestData: { data, context },
      responseData: result,
      status: 'completed',
    });

    return res.json({ success: true, executionId, ...result, timestamp: nowIso() });
  } catch (err) {
    logger.error('Integration execution error', { requestId: req.requestId, error: err.message });
    await recordExecution({
      integration: req.body?.integration || 'unknown',
      action: req.body?.action || 'unknown',
      kind: 'execute',
      requestData: req.body || {},
      responseData: {},
      status: 'failed',
      errorMessage: err.message,
    });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/integration/orchestrate', async (req, res) => {
  try {
    const { orchestration, data, context } = req.body || {};
    if (!orchestration || !data) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const result = {
      orchestration,
      status: 'completed',
      stepsExecuted: 1,
      output: { received: true },
    };

    const executionId = await recordExecution({
      integration: `${orchestration}`.trim(),
      action: 'orchestrate',
      kind: 'orchestrate',
      requestData: { data, context },
      responseData: result,
      status: 'completed',
    });

    return res.json({ success: true, executionId, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Orchestration error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/integration/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const integrations = Array.from(SUPPORTED_INTEGRATIONS.entries()).map(([name, meta]) => ({
      name,
      ...meta,
      status: 'ok',
    }));
    return res.json({ success: true, health: { integrations }, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Integration health error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/integration/sync', async (req, res) => {
  try {
    const { integration } = req.body || {};
    if (!integration) return res.status(400).json({ error: 'Missing integration', requestId: req.requestId });

    const executionId = await recordExecution({
      integration: `${integration}`.trim(),
      action: 'sync',
      kind: 'sync',
      requestData: req.body || {},
      responseData: { status: 'completed' },
      status: 'completed',
    });

    return res.json({ success: true, executionId, integration, status: 'completed', timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Sync error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/integration/history', async (req, res) => {
  try {
    const integration = req.query.integration ? `${req.query.integration}`.trim() : null;
    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;

    if (integration) {
      const result = await pool.query(
        `SELECT * FROM integration_executions WHERE integration = $1 ORDER BY started_at DESC LIMIT $2`,
        [integration, limit]
      );
      return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
    }

    const result = await pool.query(`SELECT * FROM integration_executions ORDER BY started_at DESC LIMIT $1`, [limit]);
    return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('History error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'integration-orchestrator',
      timestamp: nowIso(),
      version: 'mvp-1.0.0',
      integrations: SUPPORTED_INTEGRATIONS.size,
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Integration Orchestrator running on port ${CONFIG.port}`);
});

module.exports = app;

