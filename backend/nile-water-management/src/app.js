/**
 * SGDUS Nile Water Management (MVP)
 * - /api/v1/nile-water/allocation
 * - /api/v1/nile-water/monitoring
 * - /api/v1/nile-water/recommendations
 * - /api/v1/nile-water/statistics
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
  port: parseInt(process.env.PORT || '3020', 10),
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

function normalizeStateCode(value) {
  if (value === undefined || value === null) return '00';
  const raw = `${value}`.trim();
  if (!/^\d{1,2}$/.test(raw)) return '00';
  return raw.padStart(2, '0');
}

const CROP_WATER_MM_PER_DAY = {
  wheat: 4,
  sorghum: 5,
  millet: 4,
  cotton: 7,
  sesame: 5,
  sugarcane: 10,
  vegetables: 6,
};

async function calculateIrrigationSchedule(farmerOid, farmLocation, cropType, farmArea) {
  const cropKey = `${cropType}`.trim().toLowerCase();
  const mmPerDay = CROP_WATER_MM_PER_DAY[cropKey] || 5;

  const areaHa = Number(farmArea);
  if (!Number.isFinite(areaHa) || areaHa <= 0) {
    const err = new Error('farmArea must be a positive number (hectares)');
    err.statusCode = 400;
    throw err;
  }

  // 1mm on 1 hectare = 10 cubic meters.
  const waterRequirementM3PerDay = mmPerDay * areaHa * 10;
  const totalWaterNeeded7Days = waterRequirementM3PerDay * 7;

  const allocation = {
    farmerOid,
    cropType: cropKey,
    farmAreaHa: areaHa,
    waterRequirementM3PerDay,
    totalWaterNeeded7Days,
    schedule: [
      { day: 1, volumeM3: waterRequirementM3PerDay },
      { day: 3, volumeM3: waterRequirementM3PerDay },
      { day: 5, volumeM3: waterRequirementM3PerDay },
      { day: 7, volumeM3: waterRequirementM3PerDay },
    ],
    calculatedAt: nowIso(),
  };

  const stateCode = normalizeStateCode(farmLocation?.stateCode || farmLocation?.state_code || farmLocation?.state || '00');

  await pool.query(
    `INSERT INTO water_allocations (id, farmer_oid, state_code, allocation_data, calculated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())`,
    [uuidv4(), farmerOid, stateCode, JSON.stringify(allocation)]
  );

  return allocation;
}

async function getWaterStatistics() {
  const daily = await pool.query(`
    SELECT DATE(calculated_at) as date, COUNT(*)::int as allocations
    FROM water_allocations
    WHERE calculated_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(calculated_at)
    ORDER BY date DESC
    LIMIT 30
  `);

  const allocationStats = await pool.query(`
    SELECT
      state_code,
      COUNT(*)::int as farmers,
      SUM((allocation_data->>'totalWaterNeeded7Days')::numeric) as total_water_7d,
      AVG((allocation_data->>'waterRequirementM3PerDay')::numeric) as avg_requirement_m3_day
    FROM water_allocations
    WHERE calculated_at >= NOW() - INTERVAL '7 days'
    GROUP BY state_code
    ORDER BY state_code ASC
  `);

  return { dailyStats: daily.rows, allocationStats: allocationStats.rows, timestamp: nowIso() };
}

// ==================== ROUTES ====================

app.post('/api/v1/nile-water/allocation', async (req, res) => {
  try {
    const { farmerOid, farmLocation, cropType, farmArea } = req.body || {};
    if (!farmerOid || !farmLocation || !cropType || !farmArea) {
      return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    }

    const allocation = await calculateIrrigationSchedule(`${farmerOid}`.trim(), farmLocation, cropType, farmArea);
    return res.json({ success: true, allocation, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Water allocation error', { requestId: req.requestId, error: err.message });
    return res.status(err.statusCode || 500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/nile-water/monitoring', async (req, res) => {
  try {
    const station = req.query.station ? `${req.query.station}`.trim() : null;
    const days = Math.max(1, Math.min(parseInt(`${req.query.days || 7}`, 10) || 7, 365));

    const params = [];
    let sql = `
      SELECT * FROM nile_monitoring
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
    `;

    if (station) {
      sql += ` AND station_id = $1`;
      params.push(station);
    }

    sql += ` ORDER BY timestamp DESC`;

    const result = await pool.query(sql, params);
    return res.json({ success: true, data: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Monitoring data error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/nile-water/recommendations', async (req, res) => {
  try {
    const farmerOid = req.query.farmerOid ? `${req.query.farmerOid}`.trim() : null;
    const urgency = req.query.urgency ? `${req.query.urgency}`.trim() : null;

    const params = [];
    let index = 1;
    let sql = `
      SELECT * FROM irrigation_alerts
      WHERE sent_at >= NOW() - INTERVAL '7 days'
    `;

    if (farmerOid) {
      sql += ` AND farmer_oid = $${index++}`;
      params.push(farmerOid);
    }

    if (urgency) {
      sql += ` AND urgency = $${index++}`;
      params.push(urgency);
    }

    sql += ` ORDER BY sent_at DESC`;

    const result = await pool.query(sql, params);
    return res.json({ success: true, recommendations: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Recommendations error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/nile-water/statistics', async (req, res) => {
  try {
    const stats = await getWaterStatistics();
    return res.json({ success: true, stats, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'nile-water-management', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Nile Water Management running on port ${CONFIG.port}`);
});

module.exports = app;

