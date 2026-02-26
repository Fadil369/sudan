/**
 * SGDUS Data Quality Engine
 * - Validate: /api/v1/data-quality/validate
 * - Cleanse: /api/v1/data-quality/cleanse
 * - Enrich: /api/v1/data-quality/enrich
 * - Batch:   /api/v1/data-quality/batch-check
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
  port: parseInt(process.env.PORT || '3011', 10),
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

const SUDAN_STATES = {
  '01': 'Khartoum',
  '02': 'Red Sea',
  '03': 'Kassala',
  '04': 'Al Qadarif',
  '05': 'River Nile',
  '06': 'Northern',
  '07': 'North Kordofan',
  '08': 'South Kordofan',
  '09': 'West Kordofan',
  '10': 'Blue Nile',
  '11': 'Sennar',
  '12': 'White Nile',
  '13': 'North Darfur',
  '14': 'South Darfur',
  '15': 'West Darfur',
  '16': 'Central Darfur',
  '17': 'East Darfur',
  '18': 'Al Jazirah',
};

const ENTITY_TABLES = {
  citizen: 'citizens',
  citizens: 'citizens',
  business: 'businesses',
  businesses: 'businesses',
};

const rulesCache = new Map(); // key -> { rules, expiresAt }

function nowIso() {
  return new Date().toISOString();
}

function clampScore(score) {
  return Math.max(0, Math.min(1, score));
}

function toTwoDigitStateCode(value) {
  if (value === undefined || value === null) return null;
  const raw = `${value}`.trim();
  if (!/^\d{1,2}$/.test(raw)) return null;
  const padded = raw.padStart(2, '0');
  if (padded === '00') return padded;
  const numeric = parseInt(padded, 10);
  if (numeric < 1 || numeric > 18) return null;
  return padded;
}

function normalizePhoneNumber(value) {
  if (value === undefined || value === null) return value;
  const raw = `${value}`.trim().replace(/[^\d+]/g, '');

  // Accept +249XXXXXXXXX (9 digits after 249)
  if (/^\+249\d{9}$/.test(raw)) return raw;
  if (/^249\d{9}$/.test(raw)) return `+${raw}`;

  // Accept local format 0XXXXXXXXX (9 digits) and convert to +249XXXXXXXXX
  if (/^0\d{9}$/.test(raw)) return `+249${raw.slice(1)}`;

  return raw;
}

function normalizeName(value) {
  if (value === undefined || value === null) return value;
  return `${value}`.trim().replace(/\s+/g, ' ');
}

function validateDateOfBirth(value) {
  const raw = `${value}`.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { valid: false, issue: 'Must be in YYYY-MM-DD format' };
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { valid: false, issue: 'Invalid date' };
  const min = new Date('1900-01-01T00:00:00Z');
  const max = new Date();
  if (date < min || date > max) return { valid: false, issue: 'Date is out of allowed range' };
  return { valid: true };
}

async function getDbRules(tableName, columnName) {
  const key = `${tableName}:${columnName}`;
  const cached = rulesCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.rules;

  try {
    const result = await pool.query(
      `SELECT rule_type, rule_value, error_message
       FROM data_quality_rules
       WHERE table_name = $1 AND column_name = $2
       ORDER BY id ASC`,
      [tableName, columnName]
    );

    const rules = result.rows.map((row) => ({
      type: row.rule_type,
      value: row.rule_value || {},
      message: row.error_message || 'Rule failed',
    }));

    rulesCache.set(key, { rules, expiresAt: Date.now() + 5 * 60 * 1000 });
    return rules;
  } catch (err) {
    logger.warn('Failed to load data quality rules', { tableName, columnName, error: err.message });
    return [];
  }
}

async function runUniqueCheck(tableName, columnName, value) {
  const allowList = {
    citizens: ['national_id', 'phone_number', 'email'],
    businesses: ['registration_number', 'email'],
  };

  if (!allowList[tableName]?.includes(columnName)) return { valid: true };

  const sql = `SELECT 1 FROM ${tableName} WHERE ${columnName} = $1 LIMIT 1`;
  const result = await pool.query(sql, [value]);
  if (result.rows.length > 0) return { valid: false, issue: 'Value already exists' };
  return { valid: true };
}

async function validateField(fieldName, value, context) {
  const issues = [];
  let score = 1.0;

  const stringValue = value === undefined || value === null ? '' : `${value}`.trim();

  // Built-in high-signal rules (MVP)
  if (fieldName === 'national_id') {
    if (!/^\d{10}$/.test(stringValue)) {
      issues.push('National ID must be 10 digits');
      score -= 0.3;
    }
  }

  if (fieldName === 'phone_number' || fieldName === 'phoneNumber') {
    const normalized = normalizePhoneNumber(stringValue);
    if (!/^\+249\d{9}$/.test(normalized)) {
      issues.push('Phone must be +249 followed by 9 digits');
      score -= 0.2;
    }
  }

  if (fieldName === 'registration_number' || fieldName === 'business_registration_number') {
    if (!/^SD-[A-Z0-9]{5}$/.test(stringValue)) {
      issues.push('Registration must be SD-XXXXX format');
      score -= 0.2;
    }
  }

  if (fieldName === 'date_of_birth' || fieldName === 'dateOfBirth') {
    const result = validateDateOfBirth(stringValue);
    if (!result.valid) {
      issues.push(result.issue);
      score -= 0.3;
    }
  }

  if (fieldName === 'first_name' || fieldName === 'middle_name' || fieldName === 'last_name' || fieldName === 'name') {
    const normalized = normalizeName(stringValue);
    if (normalized.length < 2 || normalized.length > 100) {
      issues.push('Name must be between 2-100 characters');
      score -= 0.2;
    }
    // Allow Arabic/Latin letters, spaces, hyphen, apostrophe.
    if (!/^[\p{L}\s\-']+$/u.test(normalized)) {
      issues.push('Name contains invalid characters');
      score -= 0.2;
    }
  }

  if (fieldName === 'address') {
    if (stringValue.length < 10 || stringValue.length > 500) {
      issues.push('Address must be between 10-500 characters');
      score -= 0.2;
    }

    const stateCode = toTwoDigitStateCode(context?.stateCode);
    if (stateCode && SUDAN_STATES[stateCode]) {
      const stateName = SUDAN_STATES[stateCode].toLowerCase();
      if (!stringValue.toLowerCase().includes(stateName)) {
        // Soft warning only
        score -= 0.05;
      }
    }
  }

  // Database-driven rules (if present)
  const tableName = ENTITY_TABLES[`${context?.entityType}`.toLowerCase()] || null;
  if (tableName) {
    const dbRules = await getDbRules(tableName, fieldName);
    for (const rule of dbRules) {
      if (rule.type === 'regex') {
        const pattern = rule.value?.pattern;
        if (pattern) {
          const re = new RegExp(pattern);
          if (!re.test(stringValue)) {
            issues.push(rule.message);
            score -= 0.2;
          }
        }
      } else if (rule.type === 'range') {
        const min = rule.value?.min;
        const max = rule.value?.max;
        if (min && stringValue < min) {
          issues.push(rule.message);
          score -= 0.2;
        }
        if (max && stringValue > max) {
          issues.push(rule.message);
          score -= 0.2;
        }
      } else if (rule.type === 'unique') {
        const unique = await runUniqueCheck(tableName, fieldName, stringValue);
        if (!unique.valid) {
          issues.push(rule.message || unique.issue);
          score -= 0.3;
        }
      }
    }
  }

  return {
    valid: issues.length === 0,
    score: clampScore(score),
    issues,
  };
}

function detectAnomalies(data) {
  const anomalies = [];

  if (data?.phone_number && data?.address) {
    const phoneDigits = `${data.phone_number}`.replace(/\D/g, '');
    if (phoneDigits.length >= 6 && `${data.address}`.replace(/\D/g, '').includes(phoneDigits)) {
      anomalies.push({
        type: 'PATTERN_SUSPICION',
        severity: 'MEDIUM',
        message: 'Phone number appears in address - possible data entry error',
      });
    }
  }

  if (data?.date_of_birth) {
    const raw = `${data.date_of_birth}`.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const birthDate = new Date(`${raw}T00:00:00Z`);
      if (!Number.isNaN(birthDate.getTime())) {
        const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 0 || age > 150) {
          anomalies.push({
            type: 'AGE_ANOMALY',
            severity: 'HIGH',
            message: `Age ${age} is unrealistic`,
            suggested_correction: 'Verify date of birth',
          });
        }
      }
    }
  }

  return anomalies;
}

function generateQualityBadge(score) {
  if (score >= 0.9) return 'A';
  if (score >= 0.75) return 'B';
  if (score >= 0.6) return 'C';
  return 'D';
}

function cleanseData(data) {
  const cleansed = { ...(data || {}) };

  if (cleansed.phone_number) cleansed.phone_number = normalizePhoneNumber(cleansed.phone_number);
  if (cleansed.phoneNumber) cleansed.phoneNumber = normalizePhoneNumber(cleansed.phoneNumber);

  if (cleansed.first_name) cleansed.first_name = normalizeName(cleansed.first_name);
  if (cleansed.middle_name) cleansed.middle_name = normalizeName(cleansed.middle_name);
  if (cleansed.last_name) cleansed.last_name = normalizeName(cleansed.last_name);
  if (cleansed.name) cleansed.name = normalizeName(cleansed.name);

  if (cleansed.address) cleansed.address = `${cleansed.address}`.trim().replace(/\s+/g, ' ');

  if (cleansed.stateCode) {
    const normalized = toTwoDigitStateCode(cleansed.stateCode);
    if (normalized) cleansed.stateCode = normalized;
  }

  return cleansed;
}

function enrichData(data) {
  const enriched = { ...(data || {}) };
  const stateCode = toTwoDigitStateCode(enriched.stateCode || enriched.state_code);
  if (stateCode && SUDAN_STATES[stateCode]) {
    enriched.stateName = SUDAN_STATES[stateCode];
  }
  enriched.enrichedAt = nowIso();
  return enriched;
}

function aggregateIssues(batchResults) {
  const counter = new Map();
  for (const item of batchResults) {
    const issues = item?.qualityReport?.issues || [];
    for (const issue of issues) {
      counter.set(issue, (counter.get(issue) || 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([issue, count]) => ({ issue, count }));
}

// ==================== ENDPOINTS ====================

app.post('/api/v1/data-quality/validate', async (req, res) => {
  try {
    const { data, entityType } = req.body || {};
    if (!data || !entityType) {
      return res.status(400).json({ error: 'Missing data or entityType', requestId: req.requestId });
    }

    const validationResults = {};
    const issues = [];
    let overallScore = 1.0;

    for (const [field, value] of Object.entries(data)) {
      if (field === 'biometric_data') continue;
      const validation = await validateField(field, value, { entityType, stateCode: data.stateCode || data.state_code });
      validationResults[field] = validation;
      if (!validation.valid) {
        issues.push(...validation.issues);
        overallScore = Math.min(overallScore, validation.score);
      }
    }

    const anomalies = detectAnomalies(data);

    return res.json({
      success: true,
      validationResults,
      overallScore: clampScore(overallScore),
      badge: generateQualityBadge(clampScore(overallScore)),
      issues,
      anomalies,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Validation error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Validation failed', requestId: req.requestId });
  }
});

app.post('/api/v1/data-quality/cleanse', async (req, res) => {
  try {
    const { data, entityType } = req.body || {};
    if (!data || !entityType) {
      return res.status(400).json({ error: 'Missing data or entityType', requestId: req.requestId });
    }

    const cleansedData = cleanseData(data);

    // Re-run validation over cleansed data to produce a report
    let overallScore = 1.0;
    const issues = [];
    for (const [field, value] of Object.entries(cleansedData)) {
      if (field === 'biometric_data') continue;
      const validation = await validateField(field, value, { entityType, stateCode: cleansedData.stateCode || cleansedData.state_code });
      if (!validation.valid) {
        issues.push(...validation.issues);
        overallScore = Math.min(overallScore, validation.score);
      }
    }

    const qualityReport = {
      overallScore: clampScore(overallScore),
      badge: generateQualityBadge(clampScore(overallScore)),
      issues,
      anomalies: detectAnomalies(cleansedData),
    };

    return res.json({
      success: true,
      cleansedData,
      qualityReport,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Cleansing error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Cleansing failed', requestId: req.requestId });
  }
});

app.post('/api/v1/data-quality/enrich', async (req, res) => {
  try {
    const { data, entityType } = req.body || {};
    if (!data || !entityType) {
      return res.status(400).json({ error: 'Missing data or entityType', requestId: req.requestId });
    }

    const enrichedData = enrichData(cleanseData(data));

    return res.json({
      success: true,
      enrichedData,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Enrichment error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Enrichment failed', requestId: req.requestId });
  }
});

app.post('/api/v1/data-quality/batch-check', async (req, res) => {
  try {
    const { records, entityType } = req.body || {};
    if (!records || !Array.isArray(records) || !entityType) {
      return res.status(400).json({ error: 'Invalid request', requestId: req.requestId });
    }

    const results = [];
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index] || {};
      const cleansedData = cleanseData(record);

      let overallScore = 1.0;
      const issues = [];
      for (const [field, value] of Object.entries(cleansedData)) {
        if (field === 'biometric_data') continue;
        const validation = await validateField(field, value, { entityType, stateCode: cleansedData.stateCode || cleansedData.state_code });
        if (!validation.valid) {
          issues.push(...validation.issues);
          overallScore = Math.min(overallScore, validation.score);
        }
      }

      results.push({
        index,
        recordId: record.oid || record.national_id || record.registration_number || null,
        cleansedData,
        qualityReport: {
          overallScore: clampScore(overallScore),
          badge: generateQualityBadge(clampScore(overallScore)),
          issues,
          anomalies: detectAnomalies(cleansedData),
        },
      });
    }

    const summary = {
      totalRecords: results.length,
      passed: results.filter((r) => r.qualityReport.overallScore >= 0.7).length,
      failed: results.filter((r) => r.qualityReport.overallScore < 0.7).length,
      averageScore: results.length
        ? results.reduce((sum, r) => sum + r.qualityReport.overallScore, 0) / results.length
        : 0,
      topIssues: aggregateIssues(results),
    };

    return res.json({
      success: true,
      results,
      summary,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Batch check error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Batch check failed', requestId: req.requestId });
  }
});

// Health
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      service: 'data-quality-engine',
      timestamp: nowIso(),
    });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Data Quality Engine running on port ${CONFIG.port}`);
});

module.exports = app;

