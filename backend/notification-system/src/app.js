/**
 * SGDUS Notification System (MVP)
 * - /api/v1/notifications/send
 * - /api/v1/notifications/preferences
 * - /api/v1/notifications/preferences/:userOid
 * - /api/v1/notifications/stats
 * - /api/v1/notifications/history/:userOid
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
  port: parseInt(process.env.PORT || '3016', 10),
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

async function getUserPreferences(userOid) {
  const result = await pool.query(`SELECT preferences FROM notification_preferences WHERE user_oid = $1`, [userOid]);
  return result.rows[0]?.preferences || null;
}

async function updateUserPreferences(userOid, preferences) {
  const result = await pool.query(
    `INSERT INTO notification_preferences (user_oid, preferences, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_oid)
     DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = NOW()
     RETURNING preferences, updated_at`,
    [userOid, JSON.stringify(preferences || {})]
  );
  return result.rows[0];
}

function inQuietHours(preferences, now = new Date()) {
  const quiet = preferences?.quietHours;
  if (!quiet?.start || !quiet?.end) return false;
  const [sh, sm = '0'] = `${quiet.start}`.split(':');
  const [eh, em = '0'] = `${quiet.end}`.split(':');
  const start = parseInt(sh, 10) * 60 + parseInt(sm, 10);
  const end = parseInt(eh, 10) * 60 + parseInt(em, 10);
  const current = now.getHours() * 60 + now.getMinutes();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  if (start === end) return false;
  // Overnight window support (e.g. 22:00 -> 06:00)
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

async function logNotification({ eventType, recipient, channel, payload, options, success, errorMessage }) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO notification_logs (id, event_type, recipient, channel, payload, options, success, error_message, created_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, NOW())`,
    [id, eventType, recipient, channel, JSON.stringify(payload || {}), JSON.stringify(options || {}), !!success, errorMessage || null]
  );
  return id;
}

// ==================== ROUTES ====================

app.post('/api/v1/notifications/send', async (req, res) => {
  try {
    const { eventType, data, recipients, options = {} } = req.body || {};
    if (!eventType || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Missing required fields', requestId: req.requestId });
    }

    const filteredRecipients = [];
    for (const recipient of recipients) {
      const prefs = await getUserPreferences(recipient);
      if (prefs && inQuietHours(prefs) && options.priority !== 'high') continue;
      filteredRecipients.push(recipient);
    }

    if (filteredRecipients.length === 0) {
      return res.json({
        success: false,
        message: 'All recipients filtered by preferences/quiet hours',
        timestamp: nowIso(),
        requestId: req.requestId,
      });
    }

    const channel = options.channel || 'in-app';
    const ids = [];

    for (const recipient of filteredRecipients) {
      const id = await logNotification({
        eventType,
        recipient,
        channel,
        payload: { data },
        options,
        success: true,
      });
      ids.push(id);
    }

    return res.json({
      success: true,
      notificationIds: ids,
      filteredCount: filteredRecipients.length,
      originalCount: recipients.length,
      channel,
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Notification send error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to send notification', requestId: req.requestId });
  }
});

app.post('/api/v1/notifications/preferences', async (req, res) => {
  try {
    const { userOid, preferences } = req.body || {};
    if (!userOid || !preferences) {
      return res.status(400).json({ error: 'Missing userOid or preferences', requestId: req.requestId });
    }
    const updated = await updateUserPreferences(`${userOid}`.trim(), preferences);
    return res.json({ success: true, preferences: updated.preferences, updatedAt: updated.updated_at, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Preferences update error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to update preferences', requestId: req.requestId });
  }
});

app.get('/api/v1/notifications/preferences/:userOid', async (req, res) => {
  try {
    const userOid = `${req.params.userOid}`.trim();
    const preferences = (await getUserPreferences(userOid)) || {};
    return res.json({ success: true, preferences, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('Preferences get error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get preferences', requestId: req.requestId });
  }
});

app.get('/api/v1/notifications/stats', async (req, res) => {
  try {
    const daily = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as total, COUNT(CASE WHEN success = true THEN 1 END)::int as successful
      FROM notification_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    const summary = await pool.query(`
      SELECT
        COUNT(*)::int as total_notifications,
        COUNT(CASE WHEN success = true THEN 1 END)::int as successful_notifications
      FROM notification_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    return res.json({
      success: true,
      stats: { daily: daily.rows, summary: summary.rows[0] },
      timestamp: nowIso(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error('Stats error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get stats', requestId: req.requestId });
  }
});

app.get('/api/v1/notifications/history/:userOid', async (req, res) => {
  try {
    const userOid = `${req.params.userOid}`.trim();
    const limit = req.query.limit ? Math.min(parseInt(`${req.query.limit}`, 10) || 50, 200) : 50;

    const result = await pool.query(
      `SELECT * FROM notification_logs
       WHERE recipient = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userOid, limit]
    );

    return res.json({ success: true, history: result.rows, timestamp: nowIso(), requestId: req.requestId });
  } catch (err) {
    logger.error('History error', { requestId: req.requestId, error: err.message });
    return res.status(500).json({ error: 'Failed to get history', requestId: req.requestId });
  }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'healthy', service: 'notification-system', timestamp: nowIso(), version: 'mvp-1.0.0' });
  } catch (err) {
    return res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(CONFIG.port, () => {
  logger.info(`Notification System running on port ${CONFIG.port}`);
});

module.exports = app;

