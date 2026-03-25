/**
 * Enhanced Security Configuration for Sudan National Digital Identity System
 * Implements secure configuration management with encryption and environment-specific settings
 */

import CryptoJS from 'crypto-js';
import { OID_ROOT } from '../config/oidConfig';

class SecureConfig {
  constructor() {
    this.environment = import.meta.env.MODE || 'development';
    this.config = new Map();
    this.encryptionKey = this.deriveEncryptionKey();
    this.requiredSecrets = new Set([
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'ENCRYPTION_KEY',
      'DB_PASSWORD',
      'OAUTH_CLIENT_SECRET'
    ]);
    
    this.initialize();
  }

  /**
   * Initialize secure configuration
   */
  initialize() {
    this.loadEnvironmentConfig();
    this.validateSecurityRequirements();
    this.setupSecurityHeaders();
    
    if (this.environment === 'production') {
      this.validateProductionSecurity();
    }
  }

  /**
   * Derive encryption key from environment and runtime data
   */
  deriveEncryptionKey() {
    // Never use a hardcoded fallback key in derivation (OWASP A02)
    let baseKey = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!baseKey) {
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      baseKey = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
      if (typeof window !== 'undefined') {
        console.warn('[SECURITY] REACT_APP_ENCRYPTION_KEY not set — using ephemeral dev key.');
      }
    }
    const runtimeSalt = `${this.environment}-${Date.now()}`;
    // PBKDF2 with 100,000 iterations per OWASP recommendation (A02)
    return CryptoJS.PBKDF2(baseKey, runtimeSalt, { keySize: 256/32, iterations: 100000 });
  }

  /**
   * Load and validate environment configuration
   */
  loadEnvironmentConfig() {
    // Core Security Configuration
    this.set('security.jwtSecret', this.getSecureEnv('VITE_JWT_SECRET'));
    this.set('security.jwtRefreshSecret', this.getSecureEnv('VITE_JWT_REFRESH_SECRET'));
    this.set('security.encryptionKey', this.getSecureEnv('VITE_ENCRYPTION_KEY'));
    this.set('security.sessionTimeout', parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 1800);
    this.set('security.maxLoginAttempts', parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5);
    this.set('security.accountLockoutDuration', parseInt(import.meta.env.VITE_ACCOUNT_LOCKOUT_DURATION) || 1800);

    // API Configuration
    this.set(
      'api.baseUrl',
      import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:8080/api'
    );
    this.set('api.timeout', parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000);
    this.set('api.rateLimit', parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 1000);
    this.set('api.retryAttempts', 3);

    // Government Integration APIs
    this.set('apis.health', import.meta.env.VITE_HEALTH_API_URL);
    this.set('apis.education', import.meta.env.VITE_EDUCATION_API_URL);
    this.set('apis.finance', import.meta.env.VITE_FINANCE_API_URL);
    this.set('apis.agriculture', import.meta.env.VITE_AGRICULTURE_API_URL);
    this.set('apis.energy', import.meta.env.VITE_ENERGY_API_URL);
    this.set('apis.infrastructure', import.meta.env.VITE_INFRASTRUCTURE_API_URL);
    this.set('apis.justice', import.meta.env.VITE_JUSTICE_API_URL);
    this.set('apis.foreignAffairs', import.meta.env.VITE_FOREIGN_AFFAIRS_API_URL);
    this.set('apis.labor', import.meta.env.VITE_LABOR_API_URL);
    this.set('apis.socialWelfare', import.meta.env.VITE_SOCIAL_WELFARE_API_URL);

    // BrainSAIT Integration
    this.set('brainsait.apiUrl', import.meta.env.VITE_BRAINSAIT_API_URL);
    this.set('brainsait.oidRegistry', import.meta.env.VITE_BRAINSAIT_OID_REGISTRY);
    this.set('brainsait.apiKey', this.getSecureEnv('VITE_BRAINSAIT_API_KEY'));
    this.set('brainsait.sudanOidBranch', import.meta.env.VITE_SUDAN_OID_BRANCH || OID_ROOT);

    // Blockchain Configuration
    this.set('blockchain.enabled', import.meta.env.VITE_BLOCKCHAIN_ENABLED === 'true');
    this.set('blockchain.network', import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'hyperledger-fabric');
    this.set('blockchain.caUrl', import.meta.env.VITE_BLOCKCHAIN_CA_URL);
    this.set('blockchain.peerUrl', import.meta.env.VITE_BLOCKCHAIN_PEER_URL);
    this.set('blockchain.ordererUrl', import.meta.env.VITE_BLOCKCHAIN_ORDERER_URL);
    this.set('blockchain.channel', import.meta.env.VITE_BLOCKCHAIN_CHANNEL || 'sudan-identity-channel');

    // Biometric Services
    this.set('biometric.serviceUrl', import.meta.env.VITE_BIOMETRIC_SERVICE_URL);
    this.set('biometric.apiKey', this.getSecureEnv('VITE_BIOMETRIC_API_KEY'));
    this.set('biometric.fingerprintEnabled', import.meta.env.VITE_FINGERPRINT_ENABLED === 'true');
    this.set('biometric.facialRecognitionEnabled', import.meta.env.VITE_FACIAL_RECOGNITION_ENABLED === 'true');
    this.set('biometric.irisScanEnabled', import.meta.env.VITE_IRIS_SCAN_ENABLED === 'true');
    this.set('biometric.voiceRecognitionEnabled', import.meta.env.VITE_VOICE_RECOGNITION_ENABLED === 'true');

    // Monitoring and Analytics
    this.set('monitoring.enabled', import.meta.env.VITE_MONITORING_ENABLED === 'true');
    this.set('monitoring.analyticsId', import.meta.env.VITE_ANALYTICS_ID);
    this.set('monitoring.errorReportingUrl', import.meta.env.VITE_ERROR_REPORTING_URL);
    this.set('monitoring.performanceMonitoring', import.meta.env.VITE_PERFORMANCE_MONITORING === 'true');

    // Localization
    this.set('localization.defaultLanguage', import.meta.env.VITE_DEFAULT_LANGUAGE || 'ar');
    this.set('localization.supportedLanguages', (import.meta.env.VITE_SUPPORTED_LANGUAGES || 'ar,en').split(','));
    this.set('localization.rtlLanguages', (import.meta.env.VITE_RTL_LANGUAGES || 'ar').split(','));

    // Performance and Scalability
    this.set('performance.cacheEnabled', true);
    this.set('performance.cacheTtl', parseInt(import.meta.env.VITE_CACHE_TTL) || 3600);
    this.set('performance.compressionEnabled', import.meta.env.VITE_COMPRESSION_ENABLED === 'true');
    this.set('performance.maxFileSize', parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760);
    this.set('performance.maxConcurrentUsers', parseInt(import.meta.env.VITE_MAX_CONCURRENT_USERS) || 50000000);

    // Cloud Infrastructure
    this.set('cloud.provider', import.meta.env.VITE_CLOUD_PROVIDER || 'aws');
    this.set('cloud.cdnUrl', import.meta.env.VITE_CDN_URL);
    this.set('cloud.storageBucket', import.meta.env.VITE_STORAGE_BUCKET);
    this.set('cloud.region', import.meta.env.VITE_PRIMARY_REGION || 'khartoum');

    // Feature Flags
    this.set('features.offlineSupport', import.meta.env.VITE_OFFLINE_SUPPORT === 'true');
    this.set('features.pwaEnabled', import.meta.env.VITE_PWA_ENABLED === 'true');
    this.set('features.pushNotifications', import.meta.env.VITE_PUSH_NOTIFICATIONS_ENABLED === 'true');
    this.set('features.auditLogging', import.meta.env.VITE_AUDIT_LOGGING_ENABLED !== 'false');

    // Debug and Development
    this.set('debug.mode', import.meta.env.VITE_DEBUG_MODE === 'true' && this.environment !== 'production');
    this.set('debug.mockData', import.meta.env.VITE_MOCK_DATA === 'true' && this.environment !== 'production');
  }

  /**
   * Securely retrieve environment variable with fallback
   */
  getSecureEnv(key) {
    const value = import.meta.env[key];
    if (!value) {
      if (this.environment === 'production') {
        console.warn(`[SECURITY] Missing required environment variable: ${key}`);
      }
      return this.generateSecureDefault(key);
    }
    return value;
  }

  /**
   * Generate secure default for missing environment variables
   */
  generateSecureDefault(key) {
    if (this.environment === 'production') {
      throw new Error(`Production environment requires ${key} to be set`);
    }
    
    // Generate secure random defaults for development
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return `dev-${key.toLowerCase()}-${randomBytes.toString()}`;
  }

  /**
   * Validate security requirements
   */
  validateSecurityRequirements() {
    const missingSecrets = [];
    
    for (const secret of this.requiredSecrets) {
      const value = import.meta.env[`VITE_${secret}`];
      if (!value || (this.environment === 'production' && value.includes('REPLACE'))) {
        missingSecrets.push(secret);
      }
    }

    if (missingSecrets.length > 0 && this.environment === 'production') {
      throw new Error(`Missing required production secrets: ${missingSecrets.join(', ')}`);
    }

    if (missingSecrets.length > 0) {
      console.warn('[SECURITY] Using development defaults for:', missingSecrets.join(', '));
    }
  }

  /**
   * Validate production-specific security requirements
   */
  validateProductionSecurity() {
    const checks = [
      { condition: this.get('security.jwtSecret').length >= 32, message: 'JWT secret must be at least 32 characters' },
      { condition: this.get('api.baseUrl').startsWith('https://'), message: 'API must use HTTPS in production' },
      { condition: this.get('blockchain.enabled'), message: 'Blockchain should be enabled in production' },
      { condition: this.get('monitoring.enabled'), message: 'Monitoring should be enabled in production' },
      { condition: this.get('features.auditLogging'), message: 'Audit logging should be enabled in production' },
      { condition: !this.get('debug.mode'), message: 'Debug mode should be disabled in production' }
    ];

    const failures = checks.filter(check => !check.condition);
    
    if (failures.length > 0) {
      console.error('[SECURITY] Production security validation failures:');
      failures.forEach(failure => console.error(`  - ${failure.message}`));
      throw new Error('Production security validation failed');
    }

    console.log('[SECURITY] Production security validation passed');
  }

  /**
   * Setup security headers configuration
   */
  setupSecurityHeaders() {
    this.set('security.headers', {
      'Content-Security-Policy': this.buildCSPHeader(),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    });
  }

  /**
   * Build Content Security Policy header
   */
  buildCSPHeader() {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.sudan.elfadil.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.sudan.elfadil.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    if (this.environment === 'development') {
      baseCSP.push("connect-src 'self' ws: wss: http://localhost:* https://localhost:*");
    }

    return baseCSP.join('; ');
  }

  /**
   * Encrypt sensitive configuration value
   */
  encrypt(value) {
    if (!value) return null;
    return CryptoJS.AES.encrypt(value.toString(), this.encryptionKey).toString();
  }

  /**
   * Decrypt sensitive configuration value
   */
  decrypt(encryptedValue) {
    if (!encryptedValue) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('[SECURITY] Failed to decrypt configuration value');
      return null;
    }
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    this.config.set(key, value);
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    return this.config.get(key) || defaultValue;
  }

  /**
   * Get all API endpoints
   */
  getApiEndpoints() {
    const endpoints = {};
    for (const [key, value] of this.config.entries()) {
      if (key.startsWith('apis.') && value) {
        const serviceName = key.replace('apis.', '');
        endpoints[serviceName] = value;
      }
    }
    return endpoints;
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    const securityKeys = Array.from(this.config.keys()).filter(key => key.startsWith('security.'));
    const securityConfig = {};
    
    for (const key of securityKeys) {
      const configKey = key.replace('security.', '');
      securityConfig[configKey] = this.get(key);
    }
    
    return securityConfig;
  }

  /**
   * Get environment information
   */
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      version: import.meta.env.VITE_VERSION || '1.0.0',
      buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
      region: this.get('cloud.region'),
      debug: this.get('debug.mode')
    };
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  /**
   * Get performance configuration
   */
  getPerformanceConfig() {
    const performanceKeys = Array.from(this.config.keys()).filter(key => key.startsWith('performance.'));
    const performanceConfig = {};
    
    for (const key of performanceKeys) {
      const configKey = key.replace('performance.', '');
      performanceConfig[configKey] = this.get(key);
    }
    
    return performanceConfig;
  }

  /**
   * Validate configuration integrity
   */
  validateIntegrity() {
    const requiredConfigs = [
      'api.baseUrl',
      'security.jwtSecret',
      'localization.defaultLanguage'
    ];

    const missing = requiredConfigs.filter(config => !this.get(config));
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    return true;
  }

  /**
   * Export safe configuration (without secrets)
   */
  exportSafeConfig() {
    const safeConfig = {};
    const secretKeys = ['secret', 'key', 'password', 'token'];
    
    for (const [key, value] of this.config.entries()) {
      const isSecret = secretKeys.some(secretKey => key.toLowerCase().includes(secretKey));
      
      if (!isSecret) {
        safeConfig[key] = value;
      } else {
        safeConfig[key] = '[REDACTED]';
      }
    }
    
    return safeConfig;
  }
}

// Create and export singleton instance
const secureConfig = new SecureConfig();

export default secureConfig;
export { SecureConfig };
