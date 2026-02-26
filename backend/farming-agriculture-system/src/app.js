/**
 * SGDUS Farming & Agriculture System (MVP)
 * - /api/v1/farming/crop-recommendations
 * - /api/v1/farming/livestock-recommendations
 * - /api/v1/farming/generate-plan
 * - /api/v1/farming/market-data
 * - /api/v1/farming/plans/:farmerOid
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
  port: parseInt(process.env.PORT || '3021', 10),
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

const SOIL_CROPS = {
  clay: ['sorghum', 'cotton', 'sesame'],
  sandy: ['millet', 'sesame', 'vegetables'],
  loam: ['wheat', 'vegetables', 'sugarcane'],
};

function cropRecommendations({ stateCode, farmArea, soilType }) {
  const soil = `${soilType}`.toLowerCase();
  const base = SOIL_CROPS[soil] || ['sorghum', 'millet', 'vegetables'];
  return base.map((crop) => ({
    crop,
    confidence: 0.7,
    rationale: `Soil=${soil}, state=${stateCode}, area=${farmArea}ha`,
    estimatedYield: Math.round(Number(farmArea) * 2),
  }));
}

function livestockRecommendations({ stateCode, farmArea, existing }) {
  const area = Number(farmArea);
  const maxHerd = Number.isFinite(area) ? Math.max(1, Math.floor(area * 3)) : 5;
  const candidates = ['goats', 'sheep', 'cattle', 'camels'];
  return candidates.map((animal) => ({
    animal,
    recommendedCount: Math.max(0, Math.min(maxHerd, maxHerd - (existing?.length || 0))),
    confidence: 0.6,
    rationale: `State=${stateCode}, area=${area}ha`,
  }));
}

async function storePlan(farmerOid, plan) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO agricultural_plans (id, farmer_oid, plan_data, generated_at)
     VALUES ($1, $2, $3::jsonb, NOW())`,
    [id, farmerOid, JSON.stringify(plan)]
  );
  return id;
}

// ==================== ROUTES ====================

app.post('/api/v1/farming/crop-recommendations', async (req, res) => {
  try {
    const { farmerOid, stateCode, farmArea, soilType } = req.body || {};
    if (!farmerOid || !stateCode || !farmArea || !soilType) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const recommendations = cropRecommendations({ stateCode, farmArea, soilType });
    return res.json({ success: true, recommendations, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Crop recommendations error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/farming/livestock-recommendations', async (req, res) => {
  try {
    const { farmerOid, stateCode, farmArea, existingLivestock } = req.body || {};
    if (!farmerOid || !stateCode || !farmArea) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const recommendations = livestockRecommendations({ stateCode, farmArea, existing: existingLivestock || [] });
    return res.json({ success: true, recommendations, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Livestock recommendations error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/farming/generate-plan', async (req, res) => {
  try {
    const { farmerOid, farmData } = req.body || {};
    if (!farmerOid || !farmData) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });

    const plan = {
      farmerOid,
      generatedAt: nowIso(),
      farmData,
      actions: [
        { id: 1, type: 'soil-test', priority: 'high' },
        { id: 2, type: 'seed-selection', priority: 'medium' },
        { id: 3, type: 'irrigation-schedule', priority: 'medium' },
      ],
    };

    const planId = await storePlan(`${farmerOid}`.trim(), plan);
    return res.json({ success: true, plan: { id: planId, ...plan }, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Plan generation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/farming/market-data', async (req, res) => {
  try {
    const { stateCode } = req.query || {};
    if (!stateCode) return res.status(400).json({ error: 'Missing stateCode', requestId: req.requestId });

    const result = await pool.query(
      `SELECT commodity, price, unit, recorded_at
       FROM agri_market_prices
       WHERE state_code = $1
       ORDER BY recorded_at DESC
       LIMIT 50`,
      [`${stateCode}`.trim()]
    );

    return res.json({
      success: true,
      marketData: result.rows,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Market data error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/farming/plans/:farmerOid', async (req, res) => {
  try {
    const farmerOid = `${req.params.farmerOid}`.trim();
    const result = await pool.query(
      `SELECT * FROM agricultural_plans WHERE farmer_oid = $1 ORDER BY generated_at DESC LIMIT 10`,
      [farmerOid]
    );

    return res.json({ success: true, plans: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Get plans error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'farming-agriculture-system', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Farming & Agriculture System running on port ${CONFIG.port}`);
});

module.exports = app;

