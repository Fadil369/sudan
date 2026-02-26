/**
 * SGDUS Fraud Detection System (MVP)
 * - /api/v1/fraud/detect
 * - /api/v1/fraud/batch-detect
 * - /api/v1/fraud/train-model
 * - /api/v1/fraud/update-rules
 * - /api/v1/fraud/statistics
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
  port: parseInt(process.env.PORT || '3012', 10),
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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function anonymizeData(data) {
  const anonymized = { ...(data || {}) };
  const redact = (value) => (typeof value === 'string' ? `***${value.slice(-4)}` : '***');

  const sensitive = ['national_id', 'phone_number', 'email', 'biometric_data', 'biometricHash', 'password'];
  for (const field of sensitive) {
    if (anonymized[field] !== undefined && anonymized[field] !== null) {
      anonymized[field] = redact(`${anonymized[field]}`);
    }
  }
  return anonymized;
}

class FraudDetectionSystem {
  constructor() {
    this.rules = [
      { id: 'HIGH_AMOUNT', weight: 0.4, when: (data) => typeof data.amount === 'number' && data.amount >= 1_000_000 },
      { id: 'VERY_HIGH_AMOUNT', weight: 0.3, when: (data) => typeof data.amount === 'number' && data.amount >= 10_000_000 },
      { id: 'INVALID_NATIONAL_ID', weight: 0.2, when: (data) => data.national_id && !/^\d{10}$/.test(`${data.national_id}`.trim()) },
      { id: 'INVALID_PHONE', weight: 0.2, when: (data) => data.phone_number && !/^\+?249\d{9}$/.test(`${data.phone_number}`.trim()) },
      { id: 'MISSING_CORE_FIELDS', weight: 0.2, when: (data) => !data.oid && !data.national_id && !data.registration_number },
    ];
  }

  detectFraud(data, context) {
    let risk = 0.0;
    const reasons = [];

    for (const rule of this.rules) {
      try {
        if (rule.when(data, context)) {
          risk += rule.weight;
          reasons.push(rule.id);
        }
      } catch {
        // ignore rule errors
      }
    }

    risk = clamp01(risk);

    const fraudDetected = risk >= 0.7;
    const action = risk >= 0.85 ? { type: 'BLOCK', reason: 'High risk score' } : fraudDetected ? { type: 'REVIEW', reason: 'Medium risk score' } : { type: 'ALLOW' };

    return {
      fraudDetected,
      riskScore: risk,
      reasons,
      action,
      modelVersion: 'mvp-1.0.0',
      evaluatedAt: nowIso(),
      context: {
        ip_address: context?.ip_address || null,
        user_agent: context?.user_agent || null,
      },
    };
  }

  async logFraudAttempt(input, detectionResult, context) {
    const recordId = input?.oid || input?.national_id || input?.registration_number || null;
    const row = {
      id: uuidv4(),
      recordId,
      inputData: anonymizeData(input),
      context: context || {},
      detectionResult,
      timestamp: nowIso(),
    };

    await pool.query(
      `INSERT INTO fraud_logs (id, record_id, input_data, context, detection_result, timestamp)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::timestamptz)`,
      [row.id, row.recordId, JSON.stringify(row.inputData), JSON.stringify(row.context), JSON.stringify(row.detectionResult), row.timestamp]
    );

    return row;
  }

  async trainModel(trainingData) {
    logger.info('Model training requested', { dataPoints: trainingData.length });
    return { trained: true, modelVersion: 'mvp-1.0.1', dataPoints: trainingData.length };
  }

  updateRules(newRules) {
    const normalized = (newRules || []).filter((r) => r && typeof r === 'object').map((r) => ({ ...r, id: r.id || uuidv4() }));
    this.rules.push(...normalized);
    return { updated: true, totalRules: this.rules.length };
  }
}

const fraudSystem = new FraudDetectionSystem();

// ==================== ROUTES ====================

app.post('/api/v1/fraud/detect', async (req, res) => {
  try {
    const { data, context } = req.body || {};
    if (!data) return res.status(400).json({ error: 'Missing data', requestId: req.requestId });

    const enrichedContext = {
      ...(context || {}),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      timestamp: nowIso(),
    };

    const detectionResult = fraudSystem.detectFraud(data, enrichedContext);

    if (detectionResult.fraudDetected) {
      await fraudSystem.logFraudAttempt(data, detectionResult, enrichedContext);
    }

    return res.json({
      success: true,
      ...detectionResult,
      data: anonymizeData(data),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Fraud detection error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Fraud detection failed', requestId: req.requestId });
  }
});

app.post('/api/v1/fraud/batch-detect', async (req, res) => {
  try {
    const { records, context } = req.body || {};
    if (!records || !Array.isArray(records)) return res.status(400).json({ error: 'Invalid request', requestId: req.requestId });

    const results = [];
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index] || {};
      const detectionResult = fraudSystem.detectFraud(record, context || {});
      if (detectionResult.fraudDetected) {
        await fraudSystem.logFraudAttempt(record, detectionResult, context || {});
      }
      results.push({ index, recordId: record.oid || record.national_id || record.registration_number || null, ...detectionResult });
    }

    const summary = {
      totalRecords: results.length,
      fraudDetected: results.filter((r) => r.fraudDetected).length,
      highRisk: results.filter((r) => r.riskScore >= 0.8).length,
      averageRiskScore: results.length ? results.reduce((sum, r) => sum + r.riskScore, 0) / results.length : 0,
    };

    return res.json({ success: true, results, summary, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Batch fraud detection error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Batch detection failed', requestId: req.requestId });
  }
});

app.post('/api/v1/fraud/train-model', async (req, res) => {
  try {
    const { trainingData } = req.body || {};
    if (!trainingData || !Array.isArray(trainingData)) return res.status(400).json({ error: 'Invalid training data', requestId: req.requestId });
    const result = await fraudSystem.trainModel(trainingData);
    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Model training error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Model training failed', requestId: req.requestId });
  }
});

app.post('/api/v1/fraud/update-rules', (req, res) => {
  try {
    const { rules } = req.body || {};
    if (!rules || !Array.isArray(rules)) return res.status(400).json({ error: 'Invalid rules', requestId: req.requestId });
    const result = fraudSystem.updateRules(rules);
    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Rule update error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Rule update failed', requestId: req.requestId });
  }
});

app.get('/api/v1/fraud/statistics', async (req, res) => {
  try {
    const daysRaw = req.query.days === undefined ? '30' : `${req.query.days}`;
    const days = Math.max(1, Math.min(parseInt(daysRaw, 10) || 30, 365));

    const result = await pool.query(
      `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN (detection_result->>'fraudDetected')::boolean = true THEN 1 END) as fraud_detected,
        AVG((detection_result->>'riskScore')::numeric) as avg_risk_score,
        COUNT(CASE WHEN (detection_result->'action'->>'type') = 'BLOCK' THEN 1 END) as blocked
      FROM fraud_logs
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      `
    );

    return res.json({ success: true, statistics: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Fraud statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get statistics', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'fraud-detection-system',
      timestamp: nowIso(),
      version: 'mvp-1.0.0',
      rulesCount: fraudSystem.rules.length,
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Fraud Detection System running on port ${CONFIG.port}`);
});

module.exports = app;

