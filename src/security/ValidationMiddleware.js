import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Security-focused input validation and sanitization middleware
 * Protects against XSS, SQL injection, and other injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize input for SQL injection prevention
 */
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove dangerous SQL keywords and characters
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
    .replace(/[;<>]/g, ''); // Remove dangerous characters
};

/**
 * Validate and sanitize national ID numbers
 */
export const validateNationalID = [
  body('nationalId')
    .isLength({ min: 10, max: 15 })
    .withMessage('National ID must be 10-15 characters')
    .matches(/^[0-9A-Z]+$/)
    .withMessage('National ID can only contain numbers and uppercase letters')
    .customSanitizer(sanitizeHTML),
];

/**
 * Validate user authentication data
 */
export const validateAuth = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .customSanitizer(sanitizeHTML),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .customSanitizer(sanitizeHTML),
];

/**
 * Validate citizen registration data
 */
export const validateCitizenRegistration = [
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage('First name can only contain letters and spaces (Arabic/English)')
    .customSanitizer(sanitizeHTML),
  
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage('Last name can only contain letters and spaces (Arabic/English)')
    .customSanitizer(sanitizeHTML),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
  
  body('phoneNumber')
    .matches(/^\+249[0-9]{9}$/)
    .withMessage('Phone number must be in Sudan format (+249XXXXXXXXX)')
    .customSanitizer(sanitizeHTML),
  
  body('address')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be 10-200 characters')
    .customSanitizer(sanitizeHTML),
  
  ...validateNationalID,
];

/**
 * Validate ministry/department data
 */
export const validateMinistryData = [
  body('ministryId')
    .isLength({ min: 2, max: 20 })
    .withMessage('Ministry ID must be 2-20 characters')
    .matches(/^[a-z_]+$/)
    .withMessage('Ministry ID can only contain lowercase letters and underscores')
    .customSanitizer(sanitizeHTML),
  
  body('departmentId')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('Department ID must be 2-20 characters')
    .matches(/^[a-z_]+$/)
    .withMessage('Department ID can only contain lowercase letters and underscores')
    .customSanitizer(sanitizeHTML),
  
  body('serviceId')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Service ID must be 2-30 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Service ID can only contain lowercase letters, numbers, and underscores')
    .customSanitizer(sanitizeHTML),
];

/**
 * Validate document upload data
 */
export const validateDocumentUpload = [
  body('documentType')
    .isIn(['passport', 'birth_certificate', 'marriage_certificate', 'death_certificate', 'diploma'])
    .withMessage('Invalid document type')
    .customSanitizer(sanitizeHTML),
  
  body('documentNumber')
    .isLength({ min: 5, max: 30 })
    .withMessage('Document number must be 5-30 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Document number can only contain uppercase letters, numbers, and hyphens')
    .customSanitizer(sanitizeHTML),
  
  body('issueDate')
    .isISO8601()
    .withMessage('Invalid issue date format'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format')
    .custom((value, { req }) => {
      if (value && req.body.issueDate) {
        const issue = new Date(req.body.issueDate);
        const expiry = new Date(value);
        if (expiry <= issue) {
          throw new Error('Expiry date must be after issue date');
        }
      }
      return true;
    }),
];

/**
 * Validate search queries
 */
export const validateSearch = [
  query('q')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query too long (max 100 characters)')
    .customSanitizer(sanitizeHTML)
    .customSanitizer(sanitizeSQL),
  
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer (max 1000)'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validate API parameters
 */
export const validateParams = {
  userId: param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),
  
  nationalId: param('nationalId')
    .isLength({ min: 10, max: 15 })
    .withMessage('Invalid national ID format')
    .matches(/^[0-9A-Z]+$/)
    .withMessage('National ID contains invalid characters')
    .customSanitizer(sanitizeHTML),
  
  ministryId: param('ministryId')
    .isLength({ min: 2, max: 20 })
    .withMessage('Invalid ministry ID format')
    .matches(/^[a-z_]+$/)
    .withMessage('Ministry ID contains invalid characters')
    .customSanitizer(sanitizeHTML),
};

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors for security monitoring
    console.warn('[SECURITY] Validation failed:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Sanitize request body recursively
 */
export const sanitizeRequestBody = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return sanitizeHTML(value);
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (value && typeof value === 'object') {
      const sanitized = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    return value;
  };
  
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  next();
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip + req.originalUrl;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [requestKey, timestamps] of requests.entries()) {
      requests.set(requestKey, timestamps.filter(time => time > windowStart));
      if (requests.get(requestKey).length === 0) {
        requests.delete(requestKey);
      }
    }
    
    // Check current requests
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= max) {
      // Log rate limit exceeded
      console.warn('[SECURITY] Rate limit exceeded:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        requestCount: userRequests.length,
        timestamp: new Date().toISOString()
      });
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - userRequests.length),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
    'X-Request-ID': req.headers['x-request-id'] || generateRequestId()
  });
  
  next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
};

/**
 * File upload validation
 */
export const validateFileUpload = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5
  },
  document: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3
  }
};

export default {
  sanitizeHTML,
  sanitizeSQL,
  validateNationalID,
  validateAuth,
  validateCitizenRegistration,
  validateMinistryData,
  validateDocumentUpload,
  validateSearch,
  validateParams,
  handleValidationErrors,
  sanitizeRequestBody,
  validateRateLimit,
  securityHeaders,
  validateFileUpload
};