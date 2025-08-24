import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import AuthService from './AuthService.js';

/**
 * Comprehensive API Security Middleware
 * Implements authentication, authorization, rate limiting, and security headers
 */

/**
 * JWT Authentication Middleware
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Check if token is blacklisted
    if (AuthService.isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Add user info to request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions,
      ministryId: decoded.ministryId
    };

    // Log API access
    console.log('[API] Authenticated request:', {
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    next();
  } catch (error) {
    let errorCode = 'TOKEN_INVALID';
    let statusCode = 401;

    if (error.message === 'Token has expired') {
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.message === 'Invalid token') {
      errorCode = 'TOKEN_MALFORMED';
    }

    // Log authentication failure
    console.warn('[SECURITY] Authentication failed:', {
      error: error.message,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Authentication failed',
      code: errorCode
    });
  }
};

/**
 * Authorization Middleware - Check permissions
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const hasPermission = AuthService.hasPermission(req.user.permissions, permission);
    
    if (!hasPermission) {
      // Log authorization failure
      console.warn('[SECURITY] Authorization failed:', {
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission
      });
    }

    next();
  };
};

/**
 * Role-based Authorization
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const hasRole = AuthService.hasRoleLevel(req.user.role, requiredRole);
    
    if (!hasRole) {
      console.warn('[SECURITY] Role authorization failed:', {
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        requiredRole: requiredRole,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient role level',
        code: 'INSUFFICIENT_ROLE',
        required: requiredRole,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Ministry Access Control
 */
export const requireMinistryAccess = (req, res, next) => {
  const requestedMinistryId = req.params.ministryId || req.body.ministryId;
  
  if (!requestedMinistryId) {
    return res.status(400).json({
      success: false,
      error: 'Ministry ID required',
      code: 'MINISTRY_ID_REQUIRED'
    });
  }

  // Super admin can access all ministries
  if (AuthService.hasPermission(req.user.permissions, '*')) {
    return next();
  }

  // Check if user can access the requested ministry
  const canAccess = req.user.ministryId === requestedMinistryId || 
                   AuthService.hasPermission(req.user.permissions, `read:${requestedMinistryId}_data`);

  if (!canAccess) {
    console.warn('[SECURITY] Ministry access denied:', {
      userId: req.user.id,
      username: req.user.username,
      userMinistry: req.user.ministryId,
      requestedMinistry: requestedMinistryId,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      success: false,
      error: 'Access denied to this ministry',
      code: 'MINISTRY_ACCESS_DENIED',
      requested: requestedMinistryId
    });
  }

  next();
};

/**
 * Rate Limiting Configurations
 */
export const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for internal health checks
      return req.ip === '127.0.0.1' && req.originalUrl === '/health';
    }
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      success: false,
      error: 'Too many authentication attempts',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  }),

  // Medium rate limiting for data endpoints
  data: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many data requests',
      code: 'DATA_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // File upload rate limiting
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    message: {
      success: false,
      error: 'Too many file uploads',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  })
};

/**
 * Security Headers using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.sudan.gov.sd", "wss://chat.sudan.gov.sd"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'sameorigin' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Request Logging Middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log request details
    console.log('[API] Request completed:', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Error Handling Middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Log error details
  console.error('[API] Error occurred:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  }

  const response = {
    success: false,
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString()
  };

  // Include error details in development
  if (isDevelopment) {
    response.details = error.message;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * CORS Configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from Sudan government domains
    const allowedOrigins = [
      'https://portal.sudan.gov.sd',
      'https://app.sudan.gov.sd',
      'https://api.sudan.gov.sd'
    ];
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('[SECURITY] CORS violation:', { origin, timestamp: new Date().toISOString() });
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  maxAge: 86400 // 24 hours
};

/**
 * API Response Formatter
 */
export const formatResponse = (req, res, next) => {
  // Override res.json to format all responses consistently
  const originalJson = res.json;
  
  res.json = function(data) {
    const formattedResponse = {
      success: !data.error,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      ...data
    };
    
    originalJson.call(this, formattedResponse);
  };
  
  next();
};

export default {
  authenticateToken,
  requirePermission,
  requireRole,
  requireMinistryAccess,
  rateLimiters,
  securityHeaders,
  requestLogger,
  errorHandler,
  corsOptions,
  formatResponse
};