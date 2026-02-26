/**
 * SGDUS Education Management (MVP)
 * - /api/v1/education/student-recommendations
 * - /api/v1/education/generate-plan
 * - /api/v1/education/statistics
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
  port: parseInt(process.env.PORT || '3024', 10),
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

function getStudentRecommendations({ age, currentLevel, stateCode }) {
  const nextLevel = currentLevel === 'primary' ? 'secondary' : currentLevel === 'secondary' ? 'university' : 'professional';
  const recommendations = [
    { type: 'next_level', value: nextLevel, confidence: 0.7 },
    { type: 'program', value: 'STEM', confidence: 0.6 },
    { type: 'support', value: 'scholarship_screening', confidence: 0.5 },
  ];
  return { age, currentLevel, stateCode, nextLevel, recommendations };
}

async function storePlan(studentOid, plan) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO education_plans (id, student_oid, plan_data, generated_at)
     VALUES ($1, $2, $3::jsonb, NOW())`,
    [id, studentOid, JSON.stringify(plan)]
  );
  return id;
}

async function getEducationStatistics() {
  const students = await pool.query(`SELECT COUNT(*)::int as count FROM student_registry`);
  const schools = await pool.query(`SELECT COUNT(*)::int as count FROM school_registry`);
  const plans = await pool.query(`SELECT COUNT(*)::int as count FROM education_plans WHERE generated_at >= NOW() - INTERVAL '30 days'`);
  return { students: students.rows[0], schools: schools.rows[0], plans: plans.rows[0], timestamp: nowIso() };
}

// ==================== ROUTES ====================

app.post('/api/v1/education/student-recommendations', async (req, res) => {
  try {
    const { studentOid, age, currentLevel, stateCode } = req.body || {};
    if (!studentOid || !age || !currentLevel || !stateCode) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const recommendations = getStudentRecommendations({ age, currentLevel, stateCode });
    return res.json({ success: true, recommendations, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Student recommendations error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/education/generate-plan', async (req, res) => {
  try {
    const { studentOid, educationLevel, goals } = req.body || {};
    if (!studentOid || !educationLevel) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const plan = { studentOid, educationLevel, goals: goals || [], generatedAt: nowIso(), milestones: [{ id: 1, name: 'Enrollment' }, { id: 2, name: 'Assessment' }] };
    const planId = await storePlan(`${studentOid}`.trim(), plan);
    return res.json({ success: true, plan: { id: planId, ...plan }, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Plan generation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/education/statistics', async (req, res) => {
  try {
    const stats = await getEducationStatistics();
    return res.json({ success: true, stats, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'education-management', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Education Management running on port ${CONFIG.port}`);
});

module.exports = app;

