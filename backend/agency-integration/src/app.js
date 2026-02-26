/**
 * SGDUS Agency Integration Service
 * Government Agency Interoperability System
 * 
 * Handles data exchange between 11 Sudanese government ministries:
 * - Health, Education, Finance, Agriculture, Energy
 * - Infrastructure, Justice, Foreign Affairs, Labor, Social Welfare
 * - Interior/Civil Registry
 * 
 * OID Root: 1.3.6.1.4.1.61026
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { createClient } = require('redis');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const CONFIG = {
    port: process.env.PORT || 3005,
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB || 'sgdus',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres'
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'sgdus-agency-secret-key'
    },
    agencies: {
        HEALTH: { code: 'HLT', name: 'Ministry of Health', endpoint: process.env.HEALTH_ENDPOINT },
        EDUCATION: { code: 'EDU', name: 'Ministry of Education', endpoint: process.env.EDUCATION_ENDPOINT },
        FINANCE: { code: 'FIN', name: 'Ministry of Finance', endpoint: process.env.FINANCE_ENDPOINT },
        AGRICULTURE: { code: 'AGR', name: 'Ministry of Agriculture', endpoint: process.env.AGRICULTURE_ENDPOINT },
        ENERGY: { code: 'NRG', name: 'Ministry of Energy', endpoint: process.env.ENERGY_ENDPOINT },
        INFRASTRUCTURE: { code: 'INF', name: 'Ministry of Infrastructure', endpoint: process.env.INFRASTRUCTURE_ENDPOINT },
        JUSTICE: { code: 'JUS', name: 'Ministry of Justice', endpoint: process.env.JUSTICE_ENDPOINT },
        FOREIGN_AFFAIRS: { code: 'FRA', name: 'Ministry of Foreign Affairs', endpoint: process.env.FOREIGN_AFFAIRS_ENDPOINT },
        LABOR: { code: 'LAB', name: 'Ministry of Labor', endpoint: process.env.LABOR_ENDPOINT },
        SOCIAL_WELFARE: { code: 'SWL', name: 'Ministry of Social Welfare', endpoint: process.env.SOCIAL_WELFARE_ENDPOINT },
        INTERIOR: { code: 'INT', name: 'Ministry of Interior', endpoint: process.env.INTERIOR_ENDPOINT }
    }
};

// ==================== LOGGER SETUP ====================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// ==================== DATABASE CONNECTION ====================
const pool = new Pool(CONFIG.postgres);

// ==================== REDIS CONNECTION ====================
let redisClient;
(async () => {
    redisClient = createClient({ url: CONFIG.redis.url });
    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    await redisClient.connect();
    logger.info('Connected to Redis');
})();

// ==================== EXPRESS APP ====================
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// ==================== AUTHENTICATION MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, CONFIG.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== VALIDATION MIDDLEWARE ====================
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ==================== AGENCY REGISTRATION ====================
/**
 * Register a new government agency in the system
 * POST /api/agencies/register
 */
app.post('/api/agencies/register',
    authenticateToken,
    [
        body('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code'),
        body('endpoint').isURL().withMessage('Valid endpoint URL required'),
        body('apiKey').isString().notEmpty().withMessage('API key required')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { agencyCode, endpoint, apiKey, name, description } = req.body;
            
            // Store agency configuration
            const agencyConfig = {
                code: agencyCode,
                name: name || CONFIG.agencies[agencyCode]?.name,
                endpoint,
                apiKey,
                description,
                registeredBy: req.user.oid,
                registeredAt: new Date().toISOString()
            };
            
            // Cache in Redis
            await redisClient.set(`agency:${agencyCode}`, JSON.stringify(agencyConfig));
            
            // Log to database
            await pool.query(
                `INSERT INTO agency_integration_logs 
                (agency_name, operation, entity_oid, request_data, response_data, status) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [agencyConfig.name, 'REGISTER', req.user.oid, JSON.stringify(agencyConfig), JSON.stringify({ success: true }), 'success']
            );
            
            logger.info(`Agency registered: ${agencyCode}`);
            
            res.status(201).json({
                success: true,
                message: 'Agency registered successfully',
                agencyCode,
                oid: `1.3.6.1.4.1.61026.8.${agencyCode}.${Date.now()}`
            });
        } catch (error) {
            logger.error('Agency registration error:', error);
            res.status(500).json({ error: 'Failed to register agency' });
        }
    }
);

// ==================== CITIZEN DATA SHARING ====================
/**
 * Share citizen data with a specific agency
 * POST /api/agencies/:agencyCode/share
 */
app.post('/api/agencies/:agencyCode/share',
    authenticateToken,
    [
        param('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code'),
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required'),
        body('dataFields').isArray().withMessage('Data fields array required'),
        body('purpose').isString().notEmpty().withMessage('Purpose required'),
        body('consent').isBoolean().withMessage('Consent required')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { agencyCode } = req.params;
            const { citizenOid, dataFields, purpose, consent, expiry } = req.body;
            
            // Verify consent
            if (!consent) {
                return res.status(400).json({ error: 'Citizen consent required for data sharing' });
            }
            
            // Get citizen data from database
            const citizenResult = await pool.query(
                `SELECT c.*, o.oid as oid_full 
                FROM citizens c 
                JOIN oid_registry o ON c.oid = o.oid 
                WHERE c.oid = $1`,
                [citizenOid]
            );
            
            if (citizenResult.rows.length === 0) {
                return res.status(404).json({ error: 'Citizen not found' });
            }
            
            const citizen = citizenResult.rows[0];
            
            // Filter requested fields
            const sharedData = {};
            dataFields.forEach(field => {
                if (citizen[field]) {
                    sharedData[field] = citizen[field];
                }
            });
            
            // Get agency endpoint
            const agencyConfig = JSON.parse(await redisClient.get(`agency:${agencyCode}`) || '{}');
            
            let responseData = { success: false };
            let status = 'failed';
            
            if (agencyConfig.endpoint) {
                try {
                    // Forward to agency (mock for now)
                    responseData = {
                        success: true,
                        receivedAt: new Date().toISOString(),
                        data: sharedData,
                        purpose,
                        expiry: expiry || null
                    };
                    status = 'success';
                } catch (agencyError) {
                    logger.error(`Agency ${agencyCode} communication error:`, agencyError);
                    responseData = { error: agencyError.message };
                    status = 'error';
                }
            }
            
            // Log the sharing operation
            await pool.query(
                `INSERT INTO agency_integration_logs 
                (agency_name, operation, entity_oid, request_data, response_data, status) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    CONFIG.agencies[agencyCode]?.name || agencyCode,
                    'SHARE_CITIZEN_DATA',
                    citizenOid,
                    JSON.stringify({ dataFields, purpose, consent }),
                    JSON.stringify(responseData),
                    status
                ]
            );
            
            // Cache the consent record
            const consentRecord = {
                citizenOid,
                agencyCode,
                dataFields,
                purpose,
                grantedAt: new Date().toISOString(),
                expiry
            };
            await redisClient.set(
                `consent:${citizenOid}:${agencyCode}`,
                JSON.stringify(consentRecord),
                { EX: expiry ? Math.floor((new Date(expiry) - new Date()) / 1000) : 86400 }
            );
            
            res.json({
                success: true,
                sharedData,
                consentRecord
            });
        } catch (error) {
            logger.error('Data sharing error:', error);
            res.status(500).json({ error: 'Failed to share data' });
        }
    }
);

// ==================== CROSS-AGENCY VERIFICATION ====================
/**
 * Verify citizen eligibility across multiple agencies
 * POST /api/agencies/verify
 */
app.post('/api/agencies/verify',
    authenticateToken,
    [
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required'),
        body('agencies').isArray({ min: 1 }).withMessage('At least one agency required')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { citizenOid, agencies } = req.body;
            
            const verificationResults = [];
            
            for (const agencyCode of agencies) {
                if (!CONFIG.agencies[agencyCode]) {
                    verificationResults.push({ agencyCode, status: 'invalid' });
                    continue;
                }
                
                // Check consent
                const consent = await redisClient.get(`consent:${citizenOid}:${agencyCode}`);
                
                verificationResults.push({
                    agencyCode,
                    name: CONFIG.agencies[agencyCode].name,
                    status: consent ? 'authorized' : 'no_consent',
                    verifiedAt: new Date().toISOString()
                });
            }
            
            res.json({
                citizenOid,
                verificationResults,
                verifiedAt: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Verification error:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    }
);

// ==================== SERVICE DISCOVERY ====================
/**
 * Get available services from an agency
 * GET /api/agencies/:agencyCode/services
 */
app.get('/api/agencies/:agencyCode/services',
    authenticateToken,
    [param('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code')],
    validateRequest,
    async (req, res) => {
        try {
            const { agencyCode } = req.params;
            
            // Define standard services per agency
            const services = {
                HEALTH: [
                    { id: 'HLT001', name: 'Medical Records', type: 'read' },
                    { id: 'HLT002', name: 'Vaccination Records', type: 'read' },
                    { id: 'HLT003', name: 'Hospital Admission', type: 'write' },
                    { id: 'HLT004', name: 'Prescription Verification', type: 'query' }
                ],
                EDUCATION: [
                    { id: 'EDU001', name: 'Student Records', type: 'read' },
                    { id: 'EDU002', name: 'Certificate Verification', type: 'query' },
                    { id: 'EDU003', name: 'Enrollment Status', type: 'read' }
                ],
                FINANCE: [
                    { id: 'FIN001', name: 'Tax Records', type: 'read' },
                    { id: 'FIN002', name: 'Business License Verification', type: 'query' },
                    { id: 'FIN003', name: 'Payment Processing', type: 'write' }
                ],
                AGRICULTURE: [
                    { id: 'AGR001', name: 'Farmer Registration', type: 'read' },
                    { id: 'AGR002', name: 'Land Records', type: 'read' },
                    { id: 'AGR003', name: 'Subsidy Applications', type: 'write' }
                ],
                ENERGY: [
                    { id: 'NRG001', name: 'Utility Services', type: 'read' },
                    { id: 'NRG002', name: 'Connection Status', type: 'query' }
                ],
                INFRASTRUCTURE: [
                    { id: 'INF001', name: 'Building Permits', type: 'read' },
                    { id: 'INF002', name: 'Infrastructure Projects', type: 'read' }
                ],
                JUSTICE: [
                    { id: 'JUS001', name: 'Legal Documents', type: 'read' },
                    { id: 'JUS002', name: 'Case Status', type: 'query' }
                ],
                FOREIGN_AFFAIRS: [
                    { id: 'FRA001', name: 'Passport Verification', type: 'query' },
                    { id: 'FRA002', name: 'Visa Status', type: 'query' }
                ],
                LABOR: [
                    { id: 'LAB001', name: 'Employment Records', type: 'read' },
                    { id: 'LAB002', name: 'Work Permits', type: 'read' }
                ],
                SOCIAL_WELFARE: [
                    { id: 'SWL001', name: 'Beneficiary Status', type: 'read' },
                    { id: 'SWL002', name: 'Social Support Applications', type: 'write' }
                ],
                INTERIOR: [
                    { id: 'INT001', name: 'National ID Verification', type: 'query' },
                    { id: 'INT002', name: 'Civil Registry', type: 'read' },
                    { id: 'INT003', name: 'Residency Permits', type: 'read' }
                ]
            };
            
            res.json({
                agencyCode,
                agencyName: CONFIG.agencies[agencyCode].name,
                services: services[agencyCode] || []
            });
        } catch (error) {
            logger.error('Service discovery error:', error);
            res.status(500).json({ error: 'Failed to retrieve services' });
        }
    }
);

// ==================== INTER-AGENCY DATA REQUEST ====================
/**
 * Request data from another agency on behalf of a citizen
 * POST /api/agencies/:agencyCode/request
 */
app.post('/api/agencies/:agencyCode/request',
    authenticateToken,
    [
        param('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code'),
        body('serviceId').isString().notEmpty().withMessage('Service ID required'),
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required'),
        body('requestData').isObject().withMessage('Request data required')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { agencyCode } = req.params;
            const { serviceId, citizenOid, requestData } = req.body;
            
            // Generate request ID
            const requestId = uuidv4();
            
            // Create inter-agency request record
            const request = {
                requestId,
                requestingAgency: req.user.agencyCode || 'SGDUS',
                targetAgency: agencyCode,
                serviceId,
                citizenOid,
                requestData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            // Cache request
            await redisClient.set(`request:${requestId}`, JSON.stringify(request), { EX: 3600 });
            
            // Log the request
            await pool.query(
                `INSERT INTO agency_integration_logs 
                (agency_name, operation, entity_oid, request_data, response_data, status) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    CONFIG.agencies[agencyCode]?.name,
                    'INTER_AGENCY_REQUEST',
                    citizenOid,
                    JSON.stringify(request),
                    JSON.stringify({ requestId }),
                    'pending'
                ]
            );
            
            // In production, this would make an actual API call to the target agency
            // For now, return the request ID for polling
            res.json({
                success: true,
                requestId,
                status: 'pending',
                message: 'Request submitted. Use request ID to poll for status.'
            });
        } catch (error) {
            logger.error('Inter-agency request error:', error);
            res.status(500).json({ error: 'Failed to submit request' });
        }
    }
);

// ==================== REQUEST STATUS CHECK ====================
/**
 * Check status of an inter-agency request
 * GET /api/requests/:requestId
 */
app.get('/api/requests/:requestId',
    authenticateToken,
    [param('requestId').isUUID().withMessage('Valid request ID required')],
    validateRequest,
    async (req, res) => {
        try {
            const { requestId } = req.params;
            
            const request = await redisClient.get(`request:${requestId}`);
            
            if (!request) {
                // Check database
                const dbResult = await pool.query(
                    `SELECT * FROM agency_integration_logs 
                    WHERE request_data::text LIKE $1 
                    ORDER BY created_at DESC LIMIT 1`,
                    [`%${requestId}%`]
                );
                
                if (dbResult.rows.length === 0) {
                    return res.status(404).json({ error: 'Request not found' });
                }
                
                return res.json({
                    requestId,
                    status: dbResult.rows[0].status,
                    agencyName: dbResult.rows[0].agency_name,
                    createdAt: dbResult.rows[0].created_at
                });
            }
            
            res.json(JSON.parse(request));
        } catch (error) {
            logger.error('Request status error:', error);
            res.status(500).json({ error: 'Failed to check request status' });
        }
    }
);

// ==================== CONSENT MANAGEMENT ====================
/**
 * Grant consent for data sharing
 * POST /api/consent/grant
 */
app.post('/api/consent/grant',
    authenticateToken,
    [
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required'),
        body('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code'),
        body('dataFields').isArray().withMessage('Data fields array required'),
        body('purpose').isString().notEmpty().withMessage('Purpose required'),
        body('expiry').optional().isISO8601().withMessage('Valid expiry date required')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { citizenOid, agencyCode, dataFields, purpose, expiry } = req.body;
            
            const consent = {
                citizenOid,
                agencyCode,
                dataFields,
                purpose,
                grantedAt: new Date().toISOString(),
                grantedBy: req.user.oid,
                expiry
            };
            
            // Store consent with expiry
            const ttl = expiry ? Math.floor((new Date(expiry) - new Date()) / 1000) : 31536000; // Default 1 year
            await redisClient.set(
                `consent:${citizenOid}:${agencyCode}`,
                JSON.stringify(consent),
                { EX: ttl }
            );
            
            logger.info(`Consent granted: ${citizenOid} -> ${agencyCode}`);
            
            res.json({
                success: true,
                consent,
                message: 'Consent granted successfully'
            });
        } catch (error) {
            logger.error('Consent grant error:', error);
            res.status(500).json({ error: 'Failed to grant consent' });
        }
    }
);

/**
 * Revoke consent for data sharing
 * POST /api/consent/revoke
 */
app.post('/api/consent/revoke',
    authenticateToken,
    [
        body('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required'),
        body('agencyCode').isIn(Object.keys(CONFIG.agencies)).withMessage('Invalid agency code')
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { citizenOid, agencyCode } = req.body;
            
            const deleted = await redisClient.del(`consent:${citizenOid}:${agencyCode}`);
            
            if (deleted === 0) {
                return res.status(404).json({ error: 'Consent not found' });
            }
            
            logger.info(`Consent revoked: ${citizenOid} -> ${agencyCode}`);
            
            res.json({
                success: true,
                message: 'Consent revoked successfully'
            });
        } catch (error) {
            logger.error('Consent revoke error:', error);
            res.status(500).json({ error: 'Failed to revoke consent' });
        }
    }
);

/**
 * Check active consents for a citizen
 * GET /api/consent/:citizenOid
 */
app.get('/api/consent/:citizenOid',
    authenticateToken,
    [param('citizenOid').matches(/^1\.3\.6\.1\.4\.1\.61026\.\d+\.\d+\.\d+$/).withMessage('Valid OID required')],
    validateRequest,
    async (req, res) => {
        try {
            const { citizenOid } = req.params;
            
            // Get all consents for citizen
            const keys = await redisClient.keys(`consent:${citizenOid}:*`);
            const consents = [];
            
            for (const key of keys) {
                const consent = await redisClient.get(key);
                if (consent) {
                    const agencyCode = key.split(':')[2];
                    consents.push({
                        ...JSON.parse(consent),
                        agencyName: CONFIG.agencies[agencyCode]?.name
                    });
                }
            }
            
            res.json({
                citizenOid,
                consents,
                count: consents.length
            });
        } catch (error) {
            logger.error('Consent check error:', error);
            res.status(500).json({ error: 'Failed to check consents' });
        }
    }
);

// ==================== AGENCY HEALTH CHECK ====================
/**
 * Health check for agency integration service
 * GET /health
 */
app.get('/health', async (req, res) => {
    try {
        // Check database
        await pool.query('SELECT 1');
        
        // Check Redis
        await redisClient.ping();
        
        res.json({
            status: 'healthy',
            service: 'agency-integration',
            timestamp: new Date().toISOString(),
            agencies: Object.keys(CONFIG.agencies).length
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ==================== STATISTICS ====================
/**
 * Get integration statistics
 * GET /api/stats
 */
app.get('/api/stats',
    authenticateToken,
    async (req, res) => {
        try {
            const stats = await pool.query(`
                SELECT 
                    agency_name,
                    operation,
                    status,
                    COUNT(*) as count
                FROM agency_integration_logs
                WHERE created_at > NOW() - INTERVAL '30 days'
                GROUP BY agency_name, operation, status
                ORDER BY agency_name, count DESC
            `);
            
            res.json({
                period: '30 days',
                totalOperations: stats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
                breakdown: stats.rows
            });
        } catch (error) {
            logger.error('Stats error:', error);
            res.status(500).json({ error: 'Failed to retrieve stats' });
        }
    }
);

// ==================== START SERVER ====================
app.listen(CONFIG.port, () => {
    logger.info(`Agency Integration Service running on port ${CONFIG.port}`);
    logger.info(`Supported agencies: ${Object.keys(CONFIG.agencies).join(', ')}`);
});

module.exports = app;
