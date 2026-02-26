/**
 * SGDUS Healthcare Management (MVP)
 * - /api/v1/healthcare/recommendations
 * - /api/v1/healthcare/generate-plan
 * - /api/v1/healthcare/statistics
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
  port: parseInt(process.env.PORT || '3025', 10),
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

function getHealthRecommendations({ age, gender, stateCode, conditions }) {
  const base = [
    { type: 'screening', value: 'blood_pressure', confidence: 0.7 },
    { type: 'screening', value: 'diabetes', confidence: 0.6 },
    { type: 'vaccination', value: 'routine', confidence: 0.5 },
  ];
  if (Array.isArray(conditions) && conditions.includes('pregnancy')) {
    base.push({ type: 'care', value: 'antenatal', confidence: 0.8 });
  }
  return { age, gender, stateCode, conditions: conditions || [], recommendations: base };
}

async function storePlan(patientOid, plan) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO healthcare_plans (id, patient_oid, plan_data, generated_at)
     VALUES ($1, $2, $3::jsonb, NOW())`,
    [id, patientOid, JSON.stringify(plan)]
  );
  return id;
}

async function getHealthStatistics() {
  const facilities = await pool.query(`SELECT COUNT(*)::int as count FROM health_facilities`);
  const plans = await pool.query(`SELECT COUNT(*)::int as count FROM healthcare_plans WHERE generated_at >= NOW() - INTERVAL '30 days'`);
  const alerts = await pool.query(`SELECT COUNT(*)::int as count FROM health_alerts WHERE created_at >= NOW() - INTERVAL '30 days'`);
  return { facilities: facilities.rows[0], plans: plans.rows[0], alerts: alerts.rows[0], timestamp: nowIso() };
}

// ==================== ROUTES ====================

app.post('/api/v1/healthcare/recommendations', async (req, res) => {
  try {
    const { patientOid, age, gender, stateCode, conditions } = req.body || {};
    if (!patientOid || !age || !gender || !stateCode) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const recommendations = getHealthRecommendations({ age, gender, stateCode, conditions: conditions || [] });
    return res.json({ success: true, recommendations, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Health recommendations error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/healthcare/generate-plan', async (req, res) => {
  try {
    const { patientOid, age, gender, stateCode, conditions } = req.body || {};
    if (!patientOid || !age || !gender || !stateCode) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const plan = { patientOid, age, gender, stateCode, conditions: conditions || [], generatedAt: nowIso(), actions: [{ id: 1, type: 'clinic_visit' }, { id: 2, type: 'lab_tests' }] };
    const planId = await storePlan(`${patientOid}`.trim(), plan);
    return res.json({ success: true, plan: { id: planId, ...plan }, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Plan generation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/healthcare/statistics', async (req, res) => {
  try {
    const stats = await getHealthStatistics();
    return res.json({ success: true, stats, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'healthcare-management', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Healthcare Management running on port ${CONFIG.port}`);
});

module.exports = app;

