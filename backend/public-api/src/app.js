/**
 * SGDUS Public API
 *
 * Purpose:
 * - Provide a deployable replacement for the Worker-style handlers in `sudan-main/api/*.js`
 * - Keep `/api/<service>` routes functional in the local docker-compose stack behind Kong.
 *
 * Notes:
 * - Some routes are "static" (mirroring the demo payloads in `api/*.js`)
 * - Some routes are integrated with Postgres and/or other microservices for realism.
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

// ==================== CONFIG ====================
const CONFIG = {
  port: parseInt(process.env.PORT || '3010', 10),
  oidServiceUrl: process.env.OID_SERVICE_URL || 'http://oid-service:3002',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-system:3016',
  goldTreasuresServiceUrl: process.env.GOLD_TREASURES_SERVICE_URL || 'http://gold-treasures-management:3022',
  postgres: process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: false }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || 'sudan_identity',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
      },
};

// ==================== LOGGER ====================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

// ==================== DATABASE ====================
const pool = new Pool(CONFIG.postgres);
pool
  .query('SELECT NOW()')
  .then(() => logger.info('Connected to PostgreSQL'))
  .catch((err) => logger.error('PostgreSQL connection error', { error: err.message }));

// ==================== EXPRESS APP ====================
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '2mb' }));

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

function pickUserOid(req) {
  const header = req.header('X-Citizen-OID');
  if (header && `${header}`.trim()) return `${header}`.trim();
  if (req.query.userOid && `${req.query.userOid}`.trim()) return `${req.query.userOid}`.trim();
  return null;
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ============================================================================
// Infrastructure (mirrors api/infrastructure.js)
// ============================================================================

const infrastructureData = {
  roadNetwork: 12000,
  bridges: 500,
};

const infrastructureWater = {
  dams: 85,
  irrigationSchemes: 120,
  waterTreatmentPlants: 45,
  rivers: ['Nile', 'Blue Nile', 'White Nile', 'Atbara', 'Gash', 'Barkadeer'],
  reservoirs: 200,
  irrigationCapacity: 4_500_000, // hectares
  waterSupplyCoverage: 68, // percentage
  majorDams: [
    { name: 'Merowe Dam', capacity: 1250, state: 'Northern' },
    { name: 'Roseires Dam', capacity: 300, state: 'Blue Nile' },
    { name: 'Sennar Dam', capacity: 100, state: 'Sennar' },
    { name: 'Kassala Dam', capacity: 50, state: 'Kassala' },
  ],
  irrigationProjects: [
    { name: 'Gezira Scheme', area: 880_000, state: 'Gezira' },
    { name: 'Rahad Scheme', area: 300_000, state: 'Blue Nile' },
    { name: 'New Halfa Scheme', area: 250_000, state: 'Kassala' },
  ],
};

const infrastructurePorts = {
  majorPorts: [
    { name: 'Port Sudan', capacity: '4.5M TEU', type: 'Main', region: 'Red Sea' },
    { name: 'Suakin Port', capacity: '1.5M TEU', type: 'Free Zone', region: 'Red Sea' },
    { name: 'Damazin Port', capacity: '500K tons', type: 'River', region: 'Blue Nile' },
    { name: 'Kosti Port', capacity: '800K tons', type: 'River', region: 'White Nile' },
  ],
  totalThroughput: 4_500_000, // tons
  containerTerminals: 3,
  berths: 45,
  warehouses: 120,
  customsClearanceTime: 24, // hours
};

app.get('/api/infrastructure', (req, res) => {
  return res.json({ ...infrastructureData, water: infrastructureWater, ports: infrastructurePorts, timestamp: nowIso() });
});

app.get('/api/infrastructure/roads', (req, res) => {
  return res.json({ roadNetwork: infrastructureData.roadNetwork, timestamp: nowIso() });
});

app.get('/api/infrastructure/bridges', (req, res) => {
  return res.json({ bridges: infrastructureData.bridges, timestamp: nowIso() });
});

app.get('/api/infrastructure/water', (req, res) => {
  return res.json({ ...infrastructureWater, timestamp: nowIso() });
});

app.get('/api/infrastructure/water/dams', (req, res) => {
  return res.json({ dams: infrastructureWater.majorDams, timestamp: nowIso() });
});

app.get('/api/infrastructure/water/irrigation', (req, res) => {
  return res.json({ irrigationProjects: infrastructureWater.irrigationProjects, timestamp: nowIso() });
});

app.get('/api/infrastructure/water/rivers', (req, res) => {
  return res.json({ rivers: infrastructureWater.rivers, timestamp: nowIso() });
});

app.get('/api/infrastructure/ports', (req, res) => {
  return res.json({ ...infrastructurePorts, timestamp: nowIso() });
});

app.get('/api/infrastructure/ports/:portName', (req, res) => {
  const raw = `${req.params.portName || ''}`.trim().toLowerCase();
  const port = infrastructurePorts.majorPorts.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === raw || p.name.toLowerCase() === raw);
  if (!port) return res.status(404).json({ error: 'Port not found', requestId: req.requestId });
  return res.json({ port, timestamp: nowIso() });
});

// ============================================================================
// Mining (mirrors api/mining.js, enhanced with real license persistence)
// ============================================================================

const miningGold = {
  production: {
    totalOunces: 2_500_000, // annual
    value: 4_500_000_000, // USD
    majorMines: [
      { name: 'Hassai Gold Mine', production: 150_000, state: 'Red Sea' },
      { name: 'Kakara Gold Mine', production: 80_000, state: 'Red Sea' },
      { name: 'Ariab Mining', production: 65_000, state: 'Red Sea' },
    ],
  },
  exports: {
    destinations: ['UAE', 'Switzerland', 'India', 'China'],
    annualValue: 4_200_000_000, // USD
    customsCode: 'gold_7108',
  },
  artisanal: {
    miners: 150_000,
    annualProduction: 500_000, // ounces
    states: ['Red Sea', 'Kassala', 'Nile Valley', 'North Darfur'],
  },
};

const miningMinerals = [
  { name: 'Gold', reserves: 1500, unit: 'tons' },
  { name: 'Chrome', reserves: 25_000_000, unit: 'tons' },
  { name: 'Manganese', reserves: 15_000_000, unit: 'tons' },
  { name: 'Copper', reserves: 2_000_000, unit: 'tons' },
  { name: 'Iron Ore', reserves: 3_000_000_000, unit: 'tons' },
];

const miningZones = [
  { zoneCode: 'RS-01', name: 'Red Sea Belt', state: 'Red Sea', resources: ['gold', 'copper'] },
  { zoneCode: 'KS-02', name: 'Kassala Hills', state: 'Kassala', resources: ['gold', 'chrome'] },
  { zoneCode: 'NR-03', name: 'Nile Valley Corridor', state: 'River Nile', resources: ['gold', 'iron'] },
  { zoneCode: 'DF-04', name: 'Darfur Fields', state: 'North Darfur', resources: ['gold', 'manganese'] },
];

app.get('/api/mining', (req, res) => {
  const mining = {
    minerals: miningMinerals,
    licenses: { exploration: 450, mining: 180, artisanal: 2500 },
    economicContribution: { gdp: 8.5, employment: 250_000, exports: 65 },
    zones: miningZones,
  };
  return res.json({ gold: miningGold, mining, timestamp: nowIso() });
});

app.get('/api/mining/gold', (req, res) => res.json({ ...miningGold, timestamp: nowIso() }));
app.get('/api/mining/minerals', (req, res) => res.json({ minerals: miningMinerals, timestamp: nowIso() }));
app.get('/api/mining/zones', (req, res) => res.json({ zones: miningZones, timestamp: nowIso() }));
app.get('/api/mining/export', (req, res) => res.json({ exports: miningGold.exports, timestamp: nowIso() }));
app.get('/api/mining/artisanal', (req, res) => res.json({ artisanal: miningGold.artisanal, timestamp: nowIso() }));

async function listMiningLicenses(limit) {
  const safeLimit = Math.max(1, Math.min(limit || 50, 200));
  const result = await pool.query(
    `SELECT id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
            revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at
     FROM mining_licenses
     ORDER BY issued_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows;
}

async function verifyMiningLicense(licenseCode) {
  const result = await pool.query(
    `SELECT id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by,
            revoked_at, revoked_by, revoke_reason, license_code, issued_at, updated_at
     FROM mining_licenses
     WHERE license_code = $1
     ORDER BY issued_at DESC
     LIMIT 1`,
    [licenseCode]
  );
  return result.rows[0] || null;
}

app.get('/api/mining/licenses', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(`${req.query.limit}`, 10) : 50;
    const licenses = await listMiningLicenses(limit);
    return res.json({ success: true, licenses, count: licenses.length, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('List licenses failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to list licenses', requestId: req.requestId });
  }
});

app.post('/api/mining/licenses', async (req, res) => {
  try {
    const { resourceType, zoneCode, companyInfo } = req.body || {};
    if (!resourceType || !zoneCode || !companyInfo) {
      return res.status(400).json({ success: false, error: 'resourceType, zoneCode, companyInfo are required', requestId: req.requestId });
    }

    // Prefer creating via the dedicated microservice (single source of truth).
    try {
      const response = await fetch(`${CONFIG.goldTreasuresServiceUrl}/api/v1/gold-treasures/mining-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': req.requestId },
        body: JSON.stringify({ resourceType, zoneCode, companyInfo }),
      });

      if (response.ok) {
        const payload = await safeJson(response);
        return res.status(201).json({ success: true, source: 'gold-treasures-management', ...payload, timestamp: nowIso(), requestId: req.requestId });
      }

      logger.warn('Gold service non-OK, falling back to local insert', { requestId: req.requestId, status: response.status });
    } catch (err) {
      logger.warn('Gold service call failed, falling back to local insert', { requestId: req.requestId, error: err.message });
    }

    // Fallback: create directly.
    const approved = !!companyInfo?.name && !!companyInfo?.registration;
    const status = approved ? 'active' : 'pending';
    const licenseCode = `LIC-${String(zoneCode).trim()}-${String(Date.now()).slice(-6)}`;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO mining_licenses (id, resource_type, zone_code, company_info, status, approved, approved_at, approved_by, license_code, issued_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        id,
        String(resourceType).trim().toLowerCase(),
        String(zoneCode).trim(),
        JSON.stringify(companyInfo),
        status,
        approved,
        approved ? new Date() : null,
        approved ? 'auto' : null,
        licenseCode,
      ]
    );

    return res
      .status(201)
      .json({ success: true, source: 'public-api', id, approved, status, licenseCode, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Apply license failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to apply for license', requestId: req.requestId });
  }
});

app.get('/api/mining/licenses/verify/:licenseNumber', async (req, res) => {
  try {
    const licenseNumber = `${req.params.licenseNumber || ''}`.trim();
    if (!licenseNumber) return res.status(400).json({ error: 'licenseNumber is required', requestId: req.requestId });

    const license = await verifyMiningLicense(licenseNumber);
    if (!license) return res.status(404).json({ valid: false, error: 'License not found', requestId: req.requestId });

    const valid = license.approved === true && license.status === 'active';
    return res.json({ valid, license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Verify license failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ valid: false, error: 'Verification failed', requestId: req.requestId });
  }
});

app.patch('/api/mining/licenses/:licenseCode/approve', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const approvedBy = req.body?.approvedBy ? `${req.body.approvedBy}`.trim() : pickUserOid(req) || 'admin';
    const forwardedAdminKey = req.header('X-Admin-Key') || '';

    // Prefer updating via the dedicated microservice (single source of truth).
    try {
      const response = await fetch(`${CONFIG.goldTreasuresServiceUrl}/api/v1/gold-treasures/licenses/${encodeURIComponent(licenseCode)}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': req.requestId, 'X-Admin-Key': forwardedAdminKey },
        body: JSON.stringify({ approvedBy }),
      });

      if (response.ok) {
        const payload = await safeJson(response);
        return res.json({ success: true, source: 'gold-treasures-management', ...payload, timestamp: nowIso(), requestId: req.requestId });
      }

      logger.warn('Gold service approve non-OK, falling back to local update', { requestId: req.requestId, status: response.status });
    } catch (err) {
      logger.warn('Gold service approve call failed, falling back to local update', { requestId: req.requestId, error: err.message });
    }

    // Fallback: update directly.
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
    return res.json({ success: true, source: 'public-api', license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Approve license failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to approve license', requestId: req.requestId });
  }
});

app.patch('/api/mining/licenses/:licenseCode/revoke', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const revokedBy = req.body?.revokedBy ? `${req.body.revokedBy}`.trim() : pickUserOid(req) || 'admin';
    const reason = req.body?.reason ? `${req.body.reason}`.trim() : null;
    const forwardedAdminKey = req.header('X-Admin-Key') || '';

    // Prefer updating via the dedicated microservice (single source of truth).
    try {
      const response = await fetch(`${CONFIG.goldTreasuresServiceUrl}/api/v1/gold-treasures/licenses/${encodeURIComponent(licenseCode)}/revoke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': req.requestId, 'X-Admin-Key': forwardedAdminKey },
        body: JSON.stringify({ revokedBy, reason }),
      });

      if (response.ok) {
        const payload = await safeJson(response);
        return res.json({ success: true, source: 'gold-treasures-management', ...payload, timestamp: nowIso(), requestId: req.requestId });
      }

      logger.warn('Gold service revoke non-OK, falling back to local update', { requestId: req.requestId, status: response.status });
    } catch (err) {
      logger.warn('Gold service revoke call failed, falling back to local update', { requestId: req.requestId, error: err.message });
    }

    // Fallback: update directly.
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
    return res.json({ success: true, source: 'public-api', license, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Revoke license failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to revoke license', requestId: req.requestId });
  }
});

app.delete('/api/mining/licenses/:licenseCode', requireAdmin, async (req, res) => {
  try {
    const licenseCode = `${req.params.licenseCode || ''}`.trim();
    if (!licenseCode) return res.status(400).json({ success: false, error: 'licenseCode is required', requestId: req.requestId });

    const forwardedAdminKey = req.header('X-Admin-Key') || '';

    // Prefer deleting via the dedicated microservice (single source of truth).
    try {
      const response = await fetch(`${CONFIG.goldTreasuresServiceUrl}/api/v1/gold-treasures/licenses/${encodeURIComponent(licenseCode)}`, {
        method: 'DELETE',
        headers: { 'X-Request-ID': req.requestId, 'X-Admin-Key': forwardedAdminKey },
      });

      if (response.ok) {
        const payload = await safeJson(response);
        return res.json({ success: true, source: 'gold-treasures-management', ...payload, timestamp: nowIso(), requestId: req.requestId });
      }

      logger.warn('Gold service delete non-OK, falling back to local delete', { requestId: req.requestId, status: response.status });
    } catch (err) {
      logger.warn('Gold service delete call failed, falling back to local delete', { requestId: req.requestId, error: err.message });
    }

    // Fallback: delete directly.
    const result = await pool.query(
      `DELETE FROM mining_licenses
       WHERE license_code = $1
       RETURNING id, license_code`,
      [licenseCode]
    );

    const deleted = result.rows[0];
    if (!deleted) return res.status(404).json({ success: false, error: 'License not found', requestId: req.requestId });
    return res.json({ success: true, source: 'public-api', deleted, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Delete license failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to delete license', requestId: req.requestId });
  }
});

// ============================================================================
// Agriculture (mirrors api/agriculture.js, lightly enhanced)
// ============================================================================

const agricultureProfile = {
  totalFarmers: 2_800_000,
  registeredLand: 18_500_000, // hectares
  farmingTypes: { irrigated: 3_500_000, rainfed: 12_000_000, mechanized: 2_800_000, pastoral: 2_500_000 },
};

const agricultureCrops = {
  mainCrops: [
    { name: 'Sorghum', area: 6_000_000, production: 5_000_000, unit: 'tons', states: ['Kordofan', 'Darfur', 'Gezira'] },
    { name: 'Millet', area: 4_000_000, production: 2_500_000, unit: 'tons', states: ['Darfur', 'Kordofan', 'Kassala'] },
    { name: 'Wheat', area: 1_200_000, production: 900_000, unit: 'tons', states: ['Gezira', 'Nile', 'Kassala'] },
    { name: 'Cotton', area: 800_000, production: 600_000, unit: 'tons', states: ['Gezira', 'White Nile', 'Sennar'] },
    { name: 'Groundnuts', area: 1_500_000, production: 1_200_000, unit: 'tons', states: ['Kordofan', 'Darfur', 'Blue Nile'] },
    { name: 'Sesame', area: 900_000, production: 450_000, unit: 'tons', states: ['Darfur', 'Kordofan', 'Blue Nile'] },
    { name: 'Sugar Cane', area: 150_000, production: 1_800_000, unit: 'tons', states: ['Gezira', 'Kassala', 'Sennar'] },
  ],
  vegetables: [
    { name: 'Onions', production: 800_000 },
    { name: 'Tomatoes', production: 650_000 },
    { name: 'Okra', production: 400_000 },
    { name: 'Peppers', production: 350_000 },
  ],
};

const agricultureLivestock = {
  cattle: 58_000_000,
  sheep: 42_000_000,
  goats: 32_000_000,
  camels: 4_800_000,
  poultry: 55_000_000,
  states: {
    Darfur: { cattle: 15_000_000, sheep: 12_000_000 },
    Kordofan: { cattle: 12_000_000, sheep: 10_000_000 },
    BlueNile: { cattle: 8_000_000, sheep: 6_000_000 },
  },
};

const agricultureFisheries = {
  fishProduction: 150_000, // tons annually
  redSea: 45_000,
  nileSystem: 80_000,
  damsAndLakes: 25_000,
  exportValue: 180_000_000, // USD
};

app.get('/api/agriculture', (req, res) => {
  return res.json({ ...agricultureProfile, crops: agricultureCrops, livestock: agricultureLivestock, fisheries: agricultureFisheries, timestamp: nowIso() });
});

app.get('/api/agriculture/profile', (req, res) => res.json({ ...agricultureProfile, timestamp: nowIso() }));
app.get('/api/agriculture/crops', (req, res) => res.json({ ...agricultureCrops, timestamp: nowIso() }));
app.get('/api/agriculture/livestock', (req, res) => res.json({ ...agricultureLivestock, timestamp: nowIso() }));
app.get('/api/agriculture/fisheries', (req, res) => res.json({ ...agricultureFisheries, timestamp: nowIso() }));

// Mobile client convenience endpoints (stubbed/minimal)
app.get('/api/agriculture/farms', (req, res) => res.json({ farms: [], timestamp: nowIso() }));
app.post('/api/agriculture/farms', (req, res) => res.status(201).json({ success: true, message: 'Farm registered (stub)', timestamp: nowIso() }));

app.get('/api/agriculture/prices', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT state_code, commodity, price, unit, recorded_at
       FROM agri_market_prices
       ORDER BY recorded_at DESC
       LIMIT 50`
    );
    return res.json({ success: true, prices: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Get crop prices failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to get prices', requestId: req.requestId });
  }
});

app.get('/api/agriculture/weather', (req, res) => res.json({ success: true, message: 'Weather integration not configured', timestamp: nowIso() }));
app.get('/api/agriculture/subsidies', (req, res) => res.json({ success: true, subsidies: [], timestamp: nowIso() }));

// ============================================================================
// Simple modules (mirror api/*.js payloads)
// ============================================================================

app.get('/api/health', (req, res) => res.json({ hospitals: 120, beds: 25000, doctors: 8000, timestamp: nowIso() }));
app.get('/api/education', (req, res) => res.json({ schools: 5000, students: 10000000, timestamp: nowIso() }));
app.get('/api/energy', (req, res) => res.json({ totalGeneration: 15000, totalConsumption: 13500, timestamp: nowIso() }));
app.get('/api/finance', (req, res) => res.json({ gdp: 50000000000, inflation: 25.5, timestamp: nowIso() }));
app.get('/api/foreign_affairs', (req, res) => res.json({ missionsAbroad: 85, bilateralAgreements: 250, timestamp: nowIso() }));
app.get('/api/justice', (req, res) => res.json({ totalCases: 12500, resolvedCases: 9800, timestamp: nowIso() }));
app.get('/api/labor', (req, res) => res.json({ workforce: 15000000, unemploymentRate: 18.5, timestamp: nowIso() }));
app.get('/api/social_welfare', (req, res) => res.json({ beneficiaries: 5000000, programs: 50, timestamp: nowIso() }));

// ============================================================================
// Optional adapters for mobile clients (OID + Notifications)
// ============================================================================

app.get('/api/oid/resolve/:oid', async (req, res) => {
  try {
    const oid = `${req.params.oid || ''}`.trim();
    const response = await fetch(`${CONFIG.oidServiceUrl}/api/v1/oid/${encodeURIComponent(oid)}`, {
      headers: { 'X-Request-ID': req.requestId },
    });
    const payload = await safeJson(response);
    return res.status(response.status).json(payload);
  } catch (err) {
    logger.error('OID resolve proxy failed', { requestId: req.requestId, error: err.message });
    return res.status(502).json({ success: false, error: 'OID service unavailable', requestId: req.requestId });
  }
});

app.get('/api/oid/verify/:oid', async (req, res) => {
  try {
    const oid = `${req.params.oid || ''}`.trim();
    const response = await fetch(`${CONFIG.oidServiceUrl}/api/v1/oid/${encodeURIComponent(oid)}`, {
      headers: { 'X-Request-ID': req.requestId },
    });
    if (response.ok) return res.json({ valid: true, oid, timestamp: nowIso(), requestId: req.requestId });
    return res.status(404).json({ valid: false, oid, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('OID verify proxy failed', { requestId: req.requestId, error: err.message });
    return res.status(502).json({ valid: false, error: 'OID service unavailable', requestId: req.requestId });
  }
});

app.get('/api/oid/history/:oid', async (req, res) => {
  try {
    const oid = `${req.params.oid || ''}`.trim();
    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;
    const result = await pool.query(
      `SELECT id, event, user_oid, entity_oid, entity_type, created_at
       FROM audit_logs
       WHERE entity_oid = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [oid, limit]
    );
    return res.json({ success: true, oid, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('OID history failed', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ success: false, error: 'Failed to fetch history', requestId: req.requestId });
  }
});

app.get('/api/oid/qr/:oid', (req, res) => {
  const oid = `${req.params.oid || ''}`.trim();
  // QR rendering is done client-side; we return a canonical payload to encode.
  return res.json({ success: true, oid, payload: oid, timestamp: nowIso(), requestId: req.requestId });
});

app.get('/api/notifications', async (req, res) => {
  try {
    const userOid = pickUserOid(req);
    if (!userOid) return res.status(400).json({ error: 'X-Citizen-OID header (or userOid query) required', requestId: req.requestId });

    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;
    const response = await fetch(`${CONFIG.notificationServiceUrl}/api/v1/notifications/history/${encodeURIComponent(userOid)}?limit=${limit}`, {
      headers: { 'X-Request-ID': req.requestId },
    });
    const payload = await safeJson(response);
    return res.status(response.status).json(payload);
  } catch (err) {
    logger.error('Notifications proxy failed', { requestId: req.requestId, error: err.message });
    return res.status(502).json({ error: 'Notification service unavailable', requestId: req.requestId });
  }
});

app.get('/api/notifications/preferences', async (req, res) => {
  try {
    const userOid = pickUserOid(req);
    if (!userOid) return res.status(400).json({ error: 'X-Citizen-OID header (or userOid query) required', requestId: req.requestId });

    const response = await fetch(`${CONFIG.notificationServiceUrl}/api/v1/notifications/preferences/${encodeURIComponent(userOid)}`, {
      headers: { 'X-Request-ID': req.requestId },
    });
    const payload = await safeJson(response);
    return res.status(response.status).json(payload);
  } catch (err) {
    logger.error('Notification preferences proxy failed', { requestId: req.requestId, error: err.message });
    return res.status(502).json({ error: 'Notification service unavailable', requestId: req.requestId });
  }
});

app.put('/api/notifications/preferences', async (req, res) => {
  try {
    const userOid = pickUserOid(req) || req.body?.userOid;
    const preferences = req.body?.preferences ?? req.body;
    if (!userOid || !preferences) {
      return res.status(400).json({ error: 'userOid (or X-Citizen-OID) and preferences required', requestId: req.requestId });
    }

    const response = await fetch(`${CONFIG.notificationServiceUrl}/api/v1/notifications/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-ID': req.requestId },
      body: JSON.stringify({ userOid, preferences }),
    });
    const payload = await safeJson(response);
    return res.status(response.status).json(payload);
  } catch (err) {
    logger.error('Notification preferences update proxy failed', { requestId: req.requestId, error: err.message });
    return res.status(502).json({ error: 'Notification service unavailable', requestId: req.requestId });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'public-api', timestamp: nowIso() });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// ==================== START ====================
app.listen(CONFIG.port, () => {
  logger.info(`Public API running on port ${CONFIG.port}`);
});

module.exports = app;
