/**
 * SGDUS Performance Monitor (MVP)
 * - /api/v1/performance/record
 * - /api/v1/performance/summary
 * - /api/v1/performance/health-check
 * - /api/v1/performance/health
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const os = require('os');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
require('dotenv').config();

const CONFIG = {
  port: parseInt(process.env.PORT || '3019', 10),
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
app.use(express.json({ limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000,
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

// ==================== ROUTES ====================

app.post('/api/v1/performance/record', async (req, res) => {
  try {
    const { service, path, status, responseTimeMs } = req.body || {};
    if (!service || !path || status === undefined || responseTimeMs === undefined) {
      return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    }

    await pool.query(
      `INSERT INTO api_metrics (id, service, path, status, response_time, timestamp)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), `${service}`.trim(), `${path}`.trim(), parseInt(status, 10), Number(responseTimeMs)]
    );

    return res.json({ success: true, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Performance record error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to record metric', requestId: req.requestId });
  }
});

app.get('/api/v1/performance/summary', async (req, res) => {
  try {
    const minutes = req.query.minutes ? Math.max(1, Math.min(parseInt(`${req.query.minutes}`, 10) || 5, 1440)) : 5;
    const result = await pool.query(
      `
      SELECT
        AVG(response_time)::numeric(10,4) as avg_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
        (COUNT(CASE WHEN status >= 400 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::numeric(10,4) as error_rate
      FROM api_metrics
      WHERE timestamp >= NOW() - INTERVAL '${minutes} minutes'
      `
    );

    return res.json({ success: true, summary: result.rows[0], timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Summary error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get summary', requestId: req.requestId });
  }
});

app.post('/api/v1/performance/health-check', async (req, res) => {
  try {
    const { service, status, details } = req.body || {};
    if (!service || !status) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    await pool.query(
      `INSERT INTO health_checks (id, service, status, details, timestamp)
       VALUES ($1, $2, $3, $4::jsonb, NOW())`,
      [uuidv4(), `${service}`.trim(), `${status}`.trim(), JSON.stringify(details || {})]
    );

    return res.json({ success: true, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Health check record error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to record health check', requestId: req.requestId });
  }
});

app.get('/api/v1/performance/health', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT service,
             MAX(timestamp) as last_seen,
             (ARRAY_AGG(status ORDER BY timestamp DESC))[1] as last_status
      FROM health_checks
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY service
      ORDER BY service ASC
      `
    );
    return res.json({ success: true, services: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Health summary error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get health summary', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'performance-monitor',
      timestamp: nowIso(),
      version: 'mvp-1.0.0',
      node: process.version,
      system: {
        cpus: os.cpus().length,
        loadavg: os.loadavg(),
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
      },
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Performance Monitor running on port ${CONFIG.port}`);
});

module.exports = app;

