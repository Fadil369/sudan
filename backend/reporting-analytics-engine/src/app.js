/**
 * SGDUS Reporting & Analytics Engine (MVP)
 * - /api/v1/reports/generate
 * - /api/v1/reports/templates
 * - /api/v1/reports/history
 * - /api/v1/reports/schedule
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
  port: parseInt(process.env.PORT || '3013', 10),
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

const REPORT_TEMPLATES = new Map([
  [
    'citizen_summary',
    {
      name: 'citizen_summary',
      description: 'Citizen registrations grouped by state and gender',
      metrics: ['total_citizens', 'males', 'females', 'active_citizens'],
      frequency: 'daily',
      formats: ['json'],
    },
  ],
  [
    'business_summary',
    {
      name: 'business_summary',
      description: 'Business registrations grouped by state and type',
      metrics: ['total_businesses', 'active_businesses'],
      frequency: 'daily',
      formats: ['json'],
    },
  ],
  [
    'fraud_statistics',
    {
      name: 'fraud_statistics',
      description: 'Fraud detection attempts and risk trends',
      metrics: ['total_attempts', 'fraud_detected', 'avg_risk_score'],
      frequency: 'daily',
      formats: ['json'],
    },
  ],
]);

async function generateReport(reportType, filters) {
  switch (reportType) {
    case 'citizen_summary': {
      const result = await pool.query(`SELECT * FROM citizen_summary ORDER BY state_code ASC`);
      return { rows: result.rows };
    }
    case 'business_summary': {
      const result = await pool.query(`SELECT * FROM business_summary ORDER BY state_code ASC, business_type ASC`);
      return { rows: result.rows };
    }
    case 'fraud_statistics': {
      const days = Math.max(1, Math.min(parseInt(`${filters?.days || 30}`, 10) || 30, 365));
      const result = await pool.query(
        `
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN (detection_result->>'fraudDetected')::boolean = true THEN 1 END) as fraud_detected,
          AVG((detection_result->>'riskScore')::numeric) as avg_risk_score
        FROM fraud_logs
        WHERE timestamp >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        `
      );
      return { rows: result.rows, days };
    }
    default:
      throw new Error(`Unknown reportType: ${reportType}`);
  }
}

// ==================== ROUTES ====================

app.post('/api/v1/reports/generate', async (req, res) => {
  try {
    const { reportType, filters, format } = req.body || {};
    if (!reportType) return res.status(400).json({ error: 'Missing reportType', requestId: req.requestId });

    const template = REPORT_TEMPLATES.get(reportType);
    if (!template) return res.status(400).json({ error: 'Unknown reportType', requestId: req.requestId });

    const reportId = uuidv4();
    const fmt = format || 'json';
    if (!template.formats.includes(fmt)) return res.status(400).json({ error: 'Unsupported format', requestId: req.requestId });

    const generatedAt = nowIso();
    const reportData = await generateReport(reportType, filters || {});

    await pool.query(
      `INSERT INTO report_audits (id, report_type, filters, format, generated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5::timestamptz)`,
      [reportId, reportType, JSON.stringify(filters || {}), fmt, generatedAt]
    );

    return res.json({
      success: true,
      report: {
        id: reportId,
        reportType,
        generatedAt,
        format: fmt,
        template,
        data: reportData,
      },
      timestamp: generatedAt,
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Report generation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Report generation failed', requestId: req.requestId });
  }
});

app.get('/api/v1/reports/templates', (req, res) => {
  const templates = Array.from(REPORT_TEMPLATES.values());
  return res.json({ success: true, templates, timestamp: nowIso() });
});

app.get('/api/v1/reports/history', async (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;
    const result = await pool.query(
      `SELECT id, report_type, filters, format, generated_at
       FROM report_audits
       ORDER BY generated_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('History error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get history', requestId: req.requestId });
  }
});

app.post('/api/v1/reports/schedule', async (req, res) => {
  try {
    const { reportType, filters, schedule, recipients } = req.body || {};
    if (!reportType || !schedule) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const template = REPORT_TEMPLATES.get(reportType);
    if (!template) return res.status(400).json({ error: 'Unknown reportType', requestId: req.requestId });

    const scheduleId = uuidv4();
    await pool.query(
      `INSERT INTO report_schedules (id, report_type, filters, schedule, recipients, status, created_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, 'active', NOW())`,
      [scheduleId, reportType, JSON.stringify(filters || {}), JSON.stringify(schedule), JSON.stringify(recipients || [])]
    );

    return res.json({ success: true, scheduleId, message: 'Report scheduled successfully', timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Schedule error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to schedule report', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'reporting-analytics-engine',
      timestamp: nowIso(),
      version: 'mvp-1.0.0',
      reportTemplates: REPORT_TEMPLATES.size,
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Reporting Analytics Engine running on port ${CONFIG.port}`);
});

module.exports = app;

