/**
 * SGDUS Identity Service
 * Citizen & Business Registration with PostgreSQL
 * 
 * OID Root: 1.3.6.1.4.1.61026
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const CONFIG = {
    port: process.env.PORT || 3001,
    oidRoot: process.env.OID_ROOT || '1.3.6.1.4.1.61026',
    oidServiceUrl: process.env.OID_SERVICE_URL || null,
    oidServiceTimeoutMs: parseInt(process.env.OID_SERVICE_TIMEOUT_MS || '5000', 10),
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'sgdus',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres'
    },
    redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    jwt: { secret: process.env.JWT_SECRET || 'sgdus-identity-secret', expiresIn: '24h' },
    bcrypt: { saltRounds: 12 }
};

// Sudanese States (sudan.md aligned numeric codes 01-18; OID arcs must be numeric)
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
    '18': 'Al Jazirah'
};

// ==================== LOGGER ====================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'error.log', level: 'error' })]
});

// ==================== DATABASE ====================
const pool = new Pool(CONFIG.postgres);

// Test database connection
pool.query('SELECT NOW()')
    .then(() => logger.info('Connected to PostgreSQL'))
    .catch(err => logger.error('PostgreSQL connection error:', err));

// ==================== REDIS ====================
let redisClient;
(async () => {
    try {
        redisClient = createClient({ url: CONFIG.redis.url });
        redisClient.on('error', err => logger.error('Redis Error:', err));
        await redisClient.connect();
        logger.info('Connected to Redis');
    } catch (err) {
        logger.error('Redis connection error:', err);
    }
})();

// ==================== EXPRESS APP ====================
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, CONFIG.jwt.secret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ==================== IDENTIFIERS ====================
function generateNationalId(stateCode) {
    // 10 digits total (matches init.sql data quality rule): [2-digit state][8 random digits]
    const value = crypto.randomBytes(4).readUInt32BE(0) % 100000000;
    return `${stateCode}${String(value).padStart(8, '0')}`;
}

async function findExistingOid({ type, stateCode, entityId }) {
    const result = await pool.query(
        `SELECT oid FROM oid_registry WHERE type = $1 AND state_code = $2 AND entity_id = $3 ORDER BY created_at DESC LIMIT 1`,
        [type, stateCode, entityId]
    );
    return result.rows[0]?.oid || null;
}

async function ensureOidLocal({ type, stateCode, entityId, metadata }) {
    const existing = await findExistingOid({ type, stateCode, entityId });
    if (existing) return existing;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const counterResult = await client.query(
            `INSERT INTO oid_counters (type, state_code, counter)
             VALUES ($1, $2, 1)
             ON CONFLICT (type, state_code)
             DO UPDATE SET counter = oid_counters.counter + 1, updated_at = CURRENT_TIMESTAMP
             RETURNING counter`,
            [type, stateCode]
        );

        const counter = counterResult.rows[0].counter;
        const oid = `${CONFIG.oidRoot}.${type}.${stateCode}.${String(counter).padStart(8, '0')}`;

        await client.query(
            `INSERT INTO oid_registry (oid, type, state_code, entity_id, metadata, status)
             VALUES ($1, $2, $3, $4, $5::jsonb, 'active')`,
            [oid, type, stateCode, entityId, JSON.stringify(metadata ?? {})]
        );

        await client.query('COMMIT');
        return oid;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch {
            // ignore rollback errors
        }

        // If created concurrently, return existing.
        if (err && err.code === '23505') {
            const concurrent = await findExistingOid({ type, stateCode, entityId });
            if (concurrent) return concurrent;
        }

        throw err;
    } finally {
        client.release();
    }
}

async function ensureOid({ type, stateCode, entityId, metadata }) {
    if (CONFIG.oidServiceUrl) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.oidServiceTimeoutMs);
        try {
            const response = await fetch(`${CONFIG.oidServiceUrl}/api/v1/oid/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, stateCode, entityId, metadata }),
                signal: controller.signal
            });

            if (response.ok) {
                const payload = await response.json();
                if (payload?.oid) return payload.oid;
            }

            logger.warn('OID service non-OK response, falling back', { status: response.status });
        } catch (err) {
            logger.warn('OID service request failed, falling back', { error: err.message });
        } finally {
            clearTimeout(timeout);
        }
    }

    return ensureOidLocal({ type, stateCode, entityId, metadata });
}

// ==================== AUTH ROUTES ====================

// Register new citizen
app.post('/api/identity/register',
    [
        body('firstName').isString().notEmpty(),
        body('lastName').isString().notEmpty(),
        body('dateOfBirth').isISO8601(),
        body('gender').isIn(['M', 'F']),
        body('phoneNumber').matches(/^\+?249\d{9}$/),
        body('address').isString().notEmpty(),
        body('stateCode').isIn(Object.keys(SUDAN_STATES)),
        body('password').isLength({ min: 8 })
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { firstName, middleName, lastName, dateOfBirth, gender, phoneNumber, email, address, stateCode, password } = req.body;
            
            // Generate National ID
            const nationalId = generateNationalId(stateCode);
            
            // Generate OID (type 2 = citizens)
            const oid = await ensureOid({
                type: 2,
                stateCode,
                entityId: nationalId,
                metadata: { entityType: 'citizen', firstName, middleName, lastName, phoneNumber }
            });
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, CONFIG.bcrypt.saltRounds);
            
            // Generate biometric hash (placeholder)
            const biometricHash = crypto.randomUUID();
            
            // Insert citizen
            const result = await pool.query(
                `INSERT INTO citizens 
                 (oid, national_id, first_name, middle_name, last_name, date_of_birth, gender, phone_number, email, address, biometric_hash, state_code, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
                 RETURNING id, oid, national_id, first_name, last_name, phone_number, state_code`,
                [oid, nationalId, firstName, middleName || null, lastName, dateOfBirth, gender, phoneNumber, email || null, address, biometricHash, stateCode]
            );
            
            // Create user credentials
            await pool.query(
                `INSERT INTO user_credentials (user_id, password_hash, created_at)
                 VALUES ($1, $2, NOW())`,
                [oid, hashedPassword]
            );
            
            // Generate JWT
            const token = jwt.sign({ oid, nationalId, role: 'citizen' }, CONFIG.jwt.secret, { expiresIn: CONFIG.jwt.expiresIn });
            
            // Audit log
            await pool.query(
                `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, new_value)
                 VALUES ($1, $2, $3, $4, $5)`,
                ['CITIZEN_REGISTERED', oid, oid, 'citizen', JSON.stringify({ nationalId })]
            );
            
            logger.info(`Citizen registered: ${nationalId}`);
            
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                citizen: result.rows[0],
                oid,
                nationalId,
                token
            });
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed', details: error.message });
        }
    }
);

// Login
app.post('/api/identity/login',
    [
        body('nationalId').isString().notEmpty(),
        body('password').isString().notEmpty()
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { nationalId, password } = req.body;
            
            // Get citizen
            const result = await pool.query(
                `SELECT c.*, uc.password_hash FROM citizens c
                 JOIN user_credentials uc ON c.oid = uc.user_id
                 WHERE c.national_id = $1 AND c.status = 'active'`,
                [nationalId]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const citizen = result.rows[0];
            
            // Verify password
            const validPassword = await bcrypt.compare(password, citizen.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Generate JWT
            const token = jwt.sign(
                { oid: citizen.oid, nationalId: citizen.national_id, role: 'citizen' },
                CONFIG.jwt.secret,
                { expiresIn: CONFIG.jwt.expiresIn }
            );
            
            // Update last login
            await pool.query(
                `UPDATE citizens SET updated_at = NOW() WHERE oid = $1`,
                [citizen.oid]
            );
            
            logger.info(`Login: ${nationalId}`);
            
            res.json({
                success: true,
                token,
                citizen: {
                    oid: citizen.oid,
                    nationalId: citizen.national_id,
                    firstName: citizen.first_name,
                    lastName: citizen.last_name,
                    phoneNumber: citizen.phone_number,
                    stateCode: citizen.state_code,
                    state: SUDAN_STATES[citizen.state_code]
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Get Profile
app.get('/api/identity/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.oid, c.national_id, c.first_name, c.middle_name, c.last_name, 
                    c.date_of_birth, c.gender, c.phone_number, c.email, c.address, 
                    c.state_code, c.status, c.created_at
             FROM citizens c WHERE c.oid = $1`,
            [req.user.oid]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Citizen not found' });
        }
        
        const citizen = result.rows[0];
        res.json({
            success: true,
            profile: {
                ...citizen,
                state: SUDAN_STATES[citizen.state_code]
            }
        });
    } catch (error) {
        logger.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update Profile
app.put('/api/identity/profile',
    authenticateToken,
    [
        body('phoneNumber').optional().matches(/^\+?249\d{9}$/),
        body('email').optional().isEmail(),
        body('address').optional().isString()
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { phoneNumber, email, address } = req.body;
            
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (phoneNumber) {
                updates.push(`phone_number = $${paramCount++}`);
                values.push(phoneNumber);
            }
            if (email) {
                updates.push(`email = $${paramCount++}`);
                values.push(email);
            }
            if (address) {
                updates.push(`address = $${paramCount++}`);
                values.push(address);
            }
            
            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }
            
            values.push(req.user.oid);
            
            const result = await pool.query(
                `UPDATE citizens SET ${updates.join(', ')}, updated_at = NOW() WHERE oid = $${paramCount} RETURNING *`,
                values
            );
            
            await pool.query(
                `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, new_value)
                 VALUES ($1, $2, $3, $4, $5)`,
                ['PROFILE_UPDATED', req.user.oid, req.user.oid, 'citizen', JSON.stringify(req.body)]
            );
            
            res.json({ success: true, profile: result.rows[0] });
        } catch (error) {
            logger.error('Update profile error:', error);
            res.status(500).json({ error: 'Update failed' });
        }
    }
);

// Verify Identity (OTP)
app.post('/api/identity/verify',
    authenticateToken,
    [body('otp').isString().isLength({ min: 6, max: 6 })],
    validateRequest,
    async (req, res) => {
        try {
            const { otp } = req.body;
            
            // Check OTP cache
            const cachedOtp = await redisClient.get(`otp:${req.user.oid}`);
            
            if (!cachedOtp || cachedOtp !== otp) {
                return res.status(400).json({ error: 'Invalid or expired OTP' });
            }
            
            // Clear OTP
            await redisClient.del(`otp:${req.user.oid}`);
            
            // Mark as verified
            await pool.query(
                `INSERT INTO audit_logs (event, user_oid, entity_oid, entity_type, new_value)
                 VALUES ($1, $2, $3, $4, $5)`,
                ['IDENTITY_VERIFIED', req.user.oid, req.user.oid, 'citizen', JSON.stringify({ verified: true })]
            );
            
            res.json({ success: true, message: 'Identity verified successfully' });
        } catch (error) {
            logger.error('Verify error:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    }
);

// Request OTP
app.post('/api/identity/request-otp', authenticateToken, async (req, res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in Redis (5 min expiry)
        await redisClient.set(`otp:${req.user.oid}`, otp, { EX: 300 });
        
        // In production, send SMS
        logger.info(`OTP for ${req.user.oid}: ${otp}`);
        
        res.json({ success: true, message: 'OTP sent to your phone' });
    } catch (error) {
        logger.error('OTP request error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Change Password
app.post('/api/identity/change-password',
    authenticateToken,
    [body('currentPassword').isString(), body('newPassword').isLength({ min: 8 })],
    validateRequest,
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const result = await pool.query(
                'SELECT password_hash FROM user_credentials WHERE user_id = $1',
                [req.user.oid]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            const newHash = await bcrypt.hash(newPassword, CONFIG.bcrypt.saltRounds);
            await pool.query(
                'UPDATE user_credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
                [newHash, req.user.oid]
            );
            
            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            logger.error('Change password error:', error);
            res.status(500).json({ error: 'Password change failed' });
        }
    }
);

// ==================== BUSINESS REGISTRATION ====================
app.post('/api/identity/business/register',
    authenticateToken,
    [
        body('businessName').isString().notEmpty(),
        body('businessType').isIn(['individual', 'company', 'partnership', 'cooperative']),
        body('address').isString().notEmpty(),
        body('phoneNumber').matches(/^\+?249\d{9}$/),
        body('stateCode').isIn(Object.keys(SUDAN_STATES))
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { businessName, businessType, address, phoneNumber, email, stateCode, taxId } = req.body;
            
            // Generate registration number
            const registrationNumber = `SD-${Date.now().toString(36).toUpperCase()}`;
            
            // Generate OID (type 3 = businesses)
            const oid = await ensureOid({
                type: 3,
                stateCode,
                entityId: registrationNumber,
                metadata: { entityType: 'business', businessName, businessType, phoneNumber }
            });
            
            const result = await pool.query(
                `INSERT INTO businesses 
                 (oid, registration_number, business_name, business_type, owner_oid, address, phone_number, email, state_code, tax_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
                 RETURNING *`,
                [oid, registrationNumber, businessName, businessType, req.user.oid, address, phoneNumber, email || null, stateCode, taxId || null]
            );
            
            logger.info(`Business registered: ${registrationNumber}`);
            
            res.status(201).json({
                success: true,
                business: result.rows[0],
                oid,
                registrationNumber
            });
        } catch (error) {
            logger.error('Business registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Get Businesses
app.get('/api/identity/businesses', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM businesses WHERE owner_oid = $1 AND status = $2',
            [req.user.oid, 'active']
        );
        
        res.json({ success: true, businesses: result.rows });
    } catch (error) {
        logger.error('Get businesses error:', error);
        res.status(500).json({ error: 'Failed to get businesses' });
    }
});

// ==================== SEARCH ====================
app.get('/api/identity/search', authenticateToken, async (req, res) => {
    try {
        const { q, type = 'citizen' } = req.query;
        
        if (!q || q.length < 3) {
            return res.status(400).json({ error: 'Search query too short' });
        }
        
        let result;
        if (type === 'citizen') {
            result = await pool.query(
                `SELECT oid, national_id, first_name, last_name, phone_number, state_code 
                 FROM citizens 
                 WHERE (national_id LIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number LIKE $1)
                 AND status = 'active'
                 LIMIT 20`,
                [`%${q}%`]
            );
        } else if (type === 'business') {
            result = await pool.query(
                `SELECT oid, registration_number, business_name, business_type, phone_number, state_code
                 FROM businesses
                 WHERE (registration_number LIKE $1 OR business_name ILIKE $1)
                 AND status = 'active'
                 LIMIT 20`,
                [`%${q}%`]
            );
        }
        
        res.json({ success: true, results: result.rows });
    } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ==================== STATS ====================
app.get('/api/identity/stats', authenticateToken, async (req, res) => {
    try {
        const citizenCount = await pool.query('SELECT COUNT(*) FROM citizens WHERE status = $1', ['active']);
        const businessCount = await pool.query('SELECT COUNT(*) FROM businesses WHERE status = $1', ['active']);
        
        const stateStats = await pool.query(
            `SELECT state_code, COUNT(*) as count FROM citizens WHERE status = 'active' GROUP BY state_code`
        );
        
        res.json({
            success: true,
            stats: {
                totalCitizens: parseInt(citizenCount.rows[0].count),
                totalBusinesses: parseInt(businessCount.rows[0].count),
                byState: stateStats.rows
            }
        });
    } catch (error) {
        logger.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        if (redisClient) await redisClient.ping();
        
        res.json({ status: 'healthy', service: 'identity', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

// ==================== START SERVER ====================
app.listen(CONFIG.port, () => {
    logger.info(`Identity Service running on port ${CONFIG.port}`);
    logger.info(`OID Root: ${CONFIG.oidRoot}`);
});

module.exports = app;
