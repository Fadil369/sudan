/**
 * SGDUS Red Sea & Ports Management (MVP)
 * - /api/v1/ports/availability
 * - /api/v1/ports/shipping-costs
 * - /api/v1/ports/schedule-arrival
 * - /api/v1/ports/customs-clearance
 * - /api/v1/ports/statistics
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
  port: parseInt(process.env.PORT || '3023', 10),
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
    max: 1500,
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

async function getPortAvailability(portCode, vesselType, arrivalDate) {
  const status = await pool.query(
    `SELECT * FROM port_status WHERE port_code = $1 ORDER BY updated_at DESC LIMIT 1`,
    [`${portCode}`.trim()]
  );

  const available = status.rows.length === 0 ? true : status.rows[0].available;
  return {
    portCode,
    vesselType,
    arrivalDate,
    available,
    message: available ? 'Port has capacity' : 'Port currently at capacity',
    checkedAt: nowIso(),
  };
}

function calculateShippingCosts(routeCode, vesselType, cargoValue, cargoWeight) {
  const baseRate = 0.02;
  const weightRate = 0.001;
  const cost = Number(cargoValue) * baseRate + Number(cargoWeight || 0) * weightRate;
  return {
    routeCode,
    vesselType,
    estimatedCostUsd: Math.round(cost * 100) / 100,
    breakdown: { baseRate, weightRate },
  };
}

async function scheduleVesselArrival(portCode, vesselInfo, cargoDetails, arrivalDate) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO vessel_schedules (id, port_code, vessel_info, cargo_details, arrival_date, status, scheduled_at)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::timestamptz, 'scheduled', NOW())`,
    [id, `${portCode}`.trim(), JSON.stringify(vesselInfo || {}), JSON.stringify(cargoDetails || {}), arrivalDate]
  );
  return { scheduleId: id, portCode, arrivalDate, status: 'scheduled' };
}

async function processCustomsClearance(scheduleId, documents) {
  const hasManifest = !!documents?.manifest;
  const cleared = hasManifest;
  const clearanceTimeMinutes = cleared ? 30 : 0;
  const id = uuidv4();

  const duties = { total: cleared ? 50 : 0, currency: 'USD' };

  await pool.query(
    `INSERT INTO customs_clearances (id, schedule_id, documents, duties, cleared, clearance_time, issued_at)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, NOW())`,
    [id, `${scheduleId}`.trim(), JSON.stringify(documents || {}), JSON.stringify(duties), cleared, clearanceTimeMinutes]
  );

  return { clearanceId: id, cleared, duties, clearanceTimeMinutes };
}

async function getPortStatistics() {
  const scheduleStats = await pool.query(`
    SELECT port_code, COUNT(*)::int as arrivals
    FROM vessel_schedules
    WHERE scheduled_at >= NOW() - INTERVAL '30 days'
    GROUP BY port_code
  `);

  const customsStats = await pool.query(`
    SELECT
      COUNT(*)::int as clearances,
      COUNT(CASE WHEN cleared = true THEN 1 END)::int as cleared,
      AVG(clearance_time)::numeric(10,4) as avg_time
    FROM customs_clearances
    WHERE issued_at >= NOW() - INTERVAL '30 days'
  `);

  const portStatus = await pool.query(`
    SELECT * FROM port_status
    WHERE updated_at >= NOW() - INTERVAL '1 hour'
  `);

  return { schedules: scheduleStats.rows, customs: customsStats.rows[0], status: portStatus.rows, timestamp: nowIso() };
}

// ==================== ROUTES ====================

app.post('/api/v1/ports/availability', async (req, res) => {
  try {
    const { portCode, vesselType, arrivalDate } = req.body || {};
    if (!portCode || !vesselType || !arrivalDate) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const availability = await getPortAvailability(portCode, vesselType, arrivalDate);
    return res.json({ success: true, availability, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Port availability error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/ports/shipping-costs', async (req, res) => {
  try {
    const { routeCode, vesselType, cargoValue, cargoWeight } = req.body || {};
    if (!routeCode || !vesselType || !cargoValue) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const costs = calculateShippingCosts(routeCode, vesselType, cargoValue, cargoWeight || 0);
    return res.json({ success: true, costs, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Shipping costs error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/ports/schedule-arrival', async (req, res) => {
  try {
    const { portCode, vesselInfo, cargoDetails, arrivalDate } = req.body || {};
    if (!portCode || !vesselInfo || !cargoDetails || !arrivalDate) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const schedule = await scheduleVesselArrival(portCode, vesselInfo, cargoDetails, arrivalDate);
    return res.json({ success: true, schedule, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Schedule arrival error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.post('/api/v1/ports/customs-clearance', async (req, res) => {
  try {
    const { scheduleId, documents } = req.body || {};
    if (!scheduleId || !documents) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const clearance = await processCustomsClearance(scheduleId, documents);
    return res.json({ success: clearance.cleared, ...clearance, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Customs clearance error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/ports/statistics', async (req, res) => {
  try {
    const stats = await getPortStatistics();
    return res.json({ success: true, stats, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Port statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'red-sea-ports-management', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Red Sea & Ports Management running on port ${CONFIG.port}`);
});

module.exports = app;

