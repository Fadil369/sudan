/**
 * SGDUS Gold & Treasures Management (MVP)
 * - /api/v1/gold-treasures/mining-license
 * - /api/v1/gold-treasures/export
 * - /api/v1/gold-treasures/statistics
 * - /api/v1/gold-treasures/prices
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const winston = require('winston');
require('dotenv').config();

const CONFIG = {
  port: parseInt(process.env.PORT || '3022', 10),
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

function constantTimeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return next(); // allow-by-default for local/dev
  const provided = req.header('X-Admin-Key');
  if (!provided) return res.status(401).json({ success: false, error: 'Admin key required', requestId: req.requestId });
  if (!constantTimeEqual(provided, expected)) return res.status(403).json({ success: false, error: 'Invalid admin key', requestId: req.requestId });
  return next();
}

const PRICE_INDICES = new Map([
  ['gold', { currency: 'USD', price: 2000, unit: 'oz', updatedAt: nowIso() }],
  ['oil', { currency: 'USD', price: 75, unit: 'barrel', updatedAt: nowIso() }],
  ['uranium', { currency: 'USD', price: 95, unit: 'lb', updatedAt: nowIso() }],
]);

async function createMiningLicense(resourceType, zoneCode, companyInfo) {
  const id = uuidv4();
  const approved = !!companyInfo?.name && !!companyInfo?.registration;
  const licenseCode = `LIC-${zoneCode}-${String(Date.now()).slice(-6)}`;
  const status = approved ? 'active' : 'pending';
  const approvedAt = approved ? new Date() : null;
  const approvedBy = approved ? 'auto' : null;

  await pool.query(
    `INSERT INTO mining_licenses (id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by, license_code, issued_at, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, NOW(), NOW())`,
    [
      id,
      `${resourceType}`.trim().toLowerCase(),
      `${zoneCode}`.trim(),
      JSON.stringify(companyInfo || {}),
      status,
      approved,
      approvedAt,
      approvedBy,
      licenseCode,
    ]
  );

  return { id, approved, status, approvedAt, approvedBy, licenseCode };
}

async function exportResource(resourceType, quantity, quality, destination, companyLicense) {
  const id = uuidv4();

  const license = await pool.query(
    `SELECT approved, status FROM mining_licenses WHERE license_code = $1 ORDER BY issued_at DESC LIMIT 1`,
    [`${companyLicense}`.trim()]
  );
  const licenseRow = license.rows[0];
  if (!licenseRow?.approved || licenseRow.status !== 'active') {
    const err = new Error('Invalid or unapproved companyLicense');
    err.statusCode = 400;
    throw err;
  }

  await pool.query(
    `INSERT INTO resource_exports (id, resource_type, quantity, quality, destination, company_license, exported_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW())`,
    [id, `${resourceType}`.trim().toLowerCase(), Number(quantity), JSON.stringify(quality || {}), `${destination}`.trim(), `${companyLicense}`.trim()]
  );

  return { exportId: id, permit: `EXP-${String(Date.now()).slice(-8)}` };
}

async function getResourceStatistics() {
  const productionStats = await pool.query(`
    SELECT resource_type, COUNT(*)::int as records
    FROM resource_production
    WHERE recorded_at >= NOW() - INTERVAL '30 days'
    GROUP BY resource_type
  `);

  const licenseStats = await pool.query(`
    SELECT resource_type,
           COUNT(*)::int as licenses,
           COUNT(CASE WHEN approved = true THEN 1 END)::int as approved,
           COUNT(CASE WHEN status = 'revoked' THEN 1 END)::int as revoked
    FROM mining_licenses
    WHERE issued_at >= NOW() - INTERVAL '30 days'
    GROUP BY resource_type
  `);

  const priceStats = await pool.query(`
    SELECT resource_type, AVG(price)::numeric(10,4) as avg_price, MIN(price) as min_price, MAX(price) as max_price
    FROM resource_prices
    WHERE recorded_at >= NOW() - INTERVAL '30 days'
    GROUP BY resource_type
  `);

  return { production: productionStats.rows, licenses: licenseStats.rows, prices: priceStats.rows, timestamp: nowIso() };
}

// ==================== ROUTES ====================

app.post('/api/v1/gold-treasures/mining-license', async (req, res) => {
  try {
    const { resourceType, zoneCode, companyInfo } = req.body || {};
    if (!resourceType || !zoneCode || !companyInfo) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const result = await createMiningLicense(resourceType, zoneCode, companyInfo);
    return res.json({ success: result.approved, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Mining license error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/gold-treasures/licenses', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(`${req.query.limit}`, 10) : 50;
    const safeLimit = Math.max(1, Math.min(limit || 50, 200));
    const result = await pool.query(
      `SELECT id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
              revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at
       FROM mining_licenses
       ORDER BY issued_at DESC
       LIMIT $1`,
      [safeLimit]
    );
    return res.json({ success: true, licenses: result.rows, count: result.rows.length, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('List licenses error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to list licenses', requestId: req.requestId });
  }
});

app.get('/api/v1/gold-treasures/licenses/:licenseCode', async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const result = await pool.query(
      `SELECT id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
              revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at
       FROM mining_licenses
       WHERE license_code = $1
       ORDER BY issued_at DESC
       LIMIT 1`,
      [licenseCode]
    );

    const license = result.rows[0];
    if (!license) return res.status(404).json({ success: false, error: 'License not found', requestId: req.requestId });
    return res.json({ success: true, license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Get license error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to get license', requestId: req.requestId });
  }
});

app.patch('/api/v1/gold-treasures/licenses/:licenseCode/approve', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const approvedBy = req.body?.approvedBy ? `${req.body.approvedBy}`.trim() : 'admin';
    const result = await pool.query(
      `UPDATE mining_licenses
       SET approved = true,
           status = 'active',
           approved_at = COALESCE(approved_at, NOW()),
           approved_by = $2,
           revoked_at = NULL,
           revoked_by = NULL,
           revoke_reason = NULL,
           updated_at = NOW()
       WHERE license_code = $1
       RETURNING id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
                 revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at`,
      [licenseCode, approvedBy]
    );

    const license = result.rows[0];
    if (!license) return res.status(404).json({ success: false, error: 'License not found', requestId: req.requestId });
    return res.json({ success: true, license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Approve license error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to approve license', requestId: req.requestId });
  }
});

app.patch('/api/v1/gold-treasures/licenses/:licenseCode/revoke', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const revokedBy = req.body?.revokedBy ? `${req.body.revokedBy}`.trim() : 'admin';
    const reason = req.body?.reason ? `${req.body.reason}`.trim() : null;

    const result = await pool.query(
      `UPDATE mining_licenses
       SET approved = false,
           status = 'revoked',
           revoked_at = NOW(),
           revoked_by = $2,
           revoke_reason = $3,
           updated_at = NOW()
       WHERE license_code = $1
       RETURNING id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
                 revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at`,
      [licenseCode, revokedBy, reason]
    );

    const license = result.rows[0];
    if (!license) return res.status(404).json({ success: false, error: 'License not found', requestId: req.requestId });
    return res.json({ success: true, license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Revoke license error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to revoke license', requestId: req.requestId });
  }
});

app.delete('/api/v1/gold-treasures/licenses/:licenseCode', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const result = await pool.query(
      `DELETE FROM mining_licenses
       WHERE license_code = $1
       RETURNING id, license_code`,
      [licenseCode]
    );

    const deleted = result.rows[0];
    if (!deleted) return res.status(404).json({ success: false, error: 'License not found', requestId: req.requestId });
    return res.json({ success: true, deleted, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Delete license error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to delete license', requestId: req.requestId });
  }
});

app.post('/api/v1/gold-treasures/export', async (req, res) => {
  try {
    const { resourceType, quantity, quality, destination, companyLicense } = req.body || {};
    if (!resourceType || !quantity || !destination || !companyLicense) return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    const result = await exportResource(resourceType, quantity, quality, destination, companyLicense);
    return res.json({ success: true, ...result, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Export error', { requestId: req.requestId, error: err.message });
    return res.status(err.statusCode || 500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/gold-treasures/statistics', async (req, res) => {
  try {
    const stats = await getResourceStatistics();
    return res.json({ success: true, stats, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Statistics error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: err.message, requestId: req.requestId });
  }
});

app.get('/api/v1/gold-treasures/prices', async (req, res) => {
  const prices = {};
  for (const [type, info] of PRICE_INDICES.entries()) prices[type] = info;
  return res.json({ success: true, prices, timestamp: nowIso(), requestId: req.requestId });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'gold-treasures-management', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Gold & Treasures Management running on port ${CONFIG.port}`);
});

module.exports = app;
