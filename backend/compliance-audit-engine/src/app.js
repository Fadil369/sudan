/**
 * SGDUS Compliance & Audit Engine (MVP)
 * - /api/v1/compliance/check
 * - /api/v1/compliance/report
 * - /api/v1/compliance/regulatory-report
 * - /api/v1/compliance/monitor
 * - /api/v1/compliance/history
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
  port: parseInt(process.env.PORT || '3014', 10),
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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function getRequiredFields(entityType) {
  const type = `${entityType || ''}`.toLowerCase();
  if (type === 'citizen' || type === 'citizens') {
    return ['national_id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'state_code'];
  }
  if (type === 'business' || type === 'businesses') {
    return ['registration_number', 'business_name', 'business_type', 'owner_oid', 'address', 'state_code'];
  }
  return [];
}

function deriveLevel(score) {
  if (score >= 0.9) return 'GREEN';
  if (score >= 0.75) return 'YELLOW';
  return 'RED';
}

async function writeAudit(event, userOid, entityOid, entityType, oldValue, newValue, req) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, old_value, new_value, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW())`,
      [
        event,
        userOid || null,
        entityOid || null,
        entityType || null,
        oldValue === undefined ? null : JSON.stringify(oldValue),
        newValue === undefined ? null : JSON.stringify(newValue),
        req.ip,
        req.get('User-Agent') || null,
      ]
    );
  } catch (err) {
    logger.warn('Failed to write audit log', { requestId: req.requestId, error: err.message });
  }
}

async function checkCompliance(entityData, entityType, context) {
  const failures = [];
  let score = 1.0;

  const requiredFields = getRequiredFields(entityType);
  for (const field of requiredFields) {
    const value = entityData?.[field] ?? entityData?.[field.replace(/_/g, '')] ?? null;
    if (value === undefined || value === null || `${value}`.trim() === '') {
      failures.push({ field, rule: 'required', severity: 'HIGH', message: `${field} is required` });
      score -= 0.1;
    }
  }

  // Example compliance checks (extendable)
  if (entityType && `${entityType}`.toLowerCase().includes('citizen')) {
    const nid = entityData?.national_id;
    if (nid && !/^\d{10}$/.test(`${nid}`.trim())) {
      failures.push({ field: 'national_id', rule: 'format', severity: 'HIGH', message: 'national_id must be 10 digits' });
      score -= 0.15;
    }
  }

  if (entityType && `${entityType}`.toLowerCase().includes('business')) {
    const reg = entityData?.registration_number;
    if (reg && !/^SD-[A-Z0-9]{5}$/.test(`${reg}`.trim())) {
      failures.push({
        field: 'registration_number',
        rule: 'format',
        severity: 'MEDIUM',
        message: 'registration_number should be SD-XXXXX',
      });
      score -= 0.1;
    }
  }

  score = clamp01(score);
  const level = deriveLevel(score);

  const recommendations = failures.length
    ? ['Resolve required fields and formatting issues before approving.']
    : ['No action required.'];

  return {
    complianceScore: score,
    complianceLevel: level,
    failures,
    recommendations,
    context: context || {},
  };
}

async function storeComplianceReport(entityType, report) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO compliance_reports (id, entity_type, compliance_score, compliance_level, report, generated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
    [id, entityType, report.complianceScore, report.complianceLevel, JSON.stringify(report)]
  );
  return id;
}

function normalizePeriod(period) {
  const raw = `${period || ''}`.trim().toLowerCase();
  if (!raw) return '30 days';
  const allow = new Set(['7 days', '30 days', '90 days', '180 days', '1 year', '2 years']);
  if (allow.has(raw)) return raw;
  return '30 days';
}

// ==================== ROUTES ====================

app.post('/api/v1/compliance/check', async (req, res) => {
  try {
    const { entityData, entityType, context } = req.body || {};
    if (!entityData || !entityType) {
      return res.status(400).json({ error: 'Missing entityData or entityType', requestId: req.requestId });
    }

    const result = await checkCompliance(entityData, entityType, context);

    await writeAudit('COMPLIANCE_CHECK', context?.userOid, entityData?.oid || null, entityType, null, result, req);

    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Compliance check error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Compliance check failed', requestId: req.requestId });
  }
});

app.post('/api/v1/compliance/report', async (req, res) => {
  try {
    const { entityData, entityType, context } = req.body || {};
    if (!entityData || !entityType) {
      return res.status(400).json({ error: 'Missing entityData or entityType', requestId: req.requestId });
    }

    const report = await checkCompliance(entityData, entityType, context);
    const reportId = await storeComplianceReport(entityType, report);

    await writeAudit('COMPLIANCE_REPORT', context?.userOid, entityData?.oid || null, entityType, null, { reportId }, req);

    return res.json({ success: true, report: { id: reportId, ...report }, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Compliance report error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Report generation failed', requestId: req.requestId });
  }
});

app.post('/api/v1/compliance/regulatory-report', async (req, res) => {
  try {
    const { regulator, period } = req.body || {};
    if (!regulator) return res.status(400).json({ error: 'Missing regulator', requestId: req.requestId });

    const normalized = normalizePeriod(period);

    const result = await pool.query(
      `
      SELECT compliance_level, COUNT(*)::int as count
      FROM compliance_reports
      WHERE generated_at >= NOW() - INTERVAL '${normalized}'
      GROUP BY compliance_level
      ORDER BY compliance_level ASC
      `
    );

    return res.json({
      success: true,
      report: {
        regulator,
        period: normalized,
        summary: result.rows,
        generatedAt: nowIso(),
      },
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Regulatory report error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Regulatory report failed', requestId: req.requestId });
  }
});

app.get('/api/v1/compliance/monitor', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int as total,
        AVG(compliance_score)::numeric(10,4) as avg_score,
        COUNT(CASE WHEN compliance_level = 'RED' THEN 1 END)::int as red,
        COUNT(CASE WHEN compliance_level = 'YELLOW' THEN 1 END)::int as yellow,
        COUNT(CASE WHEN compliance_level = 'GREEN' THEN 1 END)::int as green
      FROM compliance_reports
      WHERE generated_at >= NOW() - INTERVAL '7 days'
      `
    );

    return res.json({ success: true, summary: result.rows[0], timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Compliance monitoring error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Monitoring failed', requestId: req.requestId });
  }
});

app.get('/api/v1/compliance/history', async (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;
    const entityType = req.query.entityType ? `${req.query.entityType}`.trim() : null;

    if (entityType) {
      const result = await pool.query(
        `
        SELECT id, entity_type, compliance_score, compliance_level, generated_at
        FROM compliance_reports
        WHERE entity_type = $1
        ORDER BY generated_at DESC
        LIMIT $2
        `,
        [entityType, limit]
      );
      return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
    }

    const result = await pool.query(
      `
      SELECT id, entity_type, compliance_score, compliance_level, generated_at
      FROM compliance_reports
      ORDER BY generated_at DESC
      LIMIT $1
      `,
      [limit]
    );

    return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Compliance history error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get history', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'compliance-audit-engine', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Compliance Audit Engine running on port ${CONFIG.port}`);
});

module.exports = app;

