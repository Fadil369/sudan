import CryptoJS from 'crypto-js';

/**
 * Secure Configuration Management
 * Handles environment variables, API keys, and sensitive configuration
 */

class ConfigManager {
  constructor() {
    this.config = new Map();
    this.encryptionKey = this.generateEncryptionKey();
    this.requiredEnvVars = [
      'REACT_APP_JWT_SECRET',
      'REACT_APP_JWT_REFRESH_SECRET',
      'REACT_APP_API_BASE_URL',
      'REACT_APP_ENCRYPTION_KEY'
    ];
    
    this.initializeConfig();
  }

  /**
   * Initialize secure configuration
   */
  initializeConfig() {
    try {
      // Load and validate environment variables
      this.loadEnvironmentVariables();
      
      // Set default secure configurations
      this.setDefaultConfig();
      
      // Validate configuration
      this.validateConfiguration();
      
      console.log('[CONFIG] Configuration initialized successfully');
    } catch (error) {
      console.error('[CONFIG] Configuration initialization failed:', error);
      throw new Error('Failed to initialize secure configuration');
    }
  }

  /**
   * Load environment variables securely
   */
  loadEnvironmentVariables() {
    // Check for required environment variables
    const missingVars = this.requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('[CONFIG] Missing environment variables:', missingVars);
      console.warn('[CONFIG] Using development defaults - NOT FOR PRODUCTION');
    }

    // JWT Configuration
    this.set('JWT_SECRET', process.env.REACT_APP_JWT_SECRET || this.generateSecureSecret());
    this.set('JWT_REFRESH_SECRET', process.env.REACT_APP_JWT_REFRESH_SECRET || this.generateSecureSecret());
    this.set('JWT_ACCESS_EXPIRY', process.env.REACT_APP_JWT_ACCESS_EXPIRY || '15m');
    this.set('JWT_REFRESH_EXPIRY', process.env.REACT_APP_JWT_REFRESH_EXPIRY || '7d');

    // API Configuration
    this.set(
      'API_BASE_URL',
      process.env.REACT_APP_API_BASE_URL ||
        process.env.REACT_APP_API_URL ||
        'http://localhost:8080/api'
    );
    this.set('API_TIMEOUT', parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000);
    this.set('API_RETRY_ATTEMPTS', parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3);

    // Security Configuration
    this.set('ENCRYPTION_KEY', process.env.REACT_APP_ENCRYPTION_KEY || this.encryptionKey);
    this.set('BCRYPT_ROUNDS', parseInt(process.env.REACT_APP_BCRYPT_ROUNDS) || 12);
    this.set('SESSION_TIMEOUT', parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 900000); // 15 minutes

    // Rate Limiting
    this.set('RATE_LIMIT_WINDOW', parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW) || 900000); // 15 minutes
    this.set('RATE_LIMIT_MAX_REQUESTS', parseInt(process.env.REACT_APP_RATE_LIMIT_MAX_REQUESTS) || 100);

    // Database Configuration (if needed)
    this.set('DB_HOST', process.env.REACT_APP_DB_HOST || 'localhost');
    this.set('DB_PORT', parseInt(process.env.REACT_APP_DB_PORT) || 5432);
    this.set('DB_NAME', process.env.REACT_APP_DB_NAME || 'sudan_oid');
    this.set('DB_SSL', process.env.REACT_APP_DB_SSL === 'true');

    // External Services
    this.set('BLOCKCHAIN_ENDPOINT', process.env.REACT_APP_BLOCKCHAIN_ENDPOINT || 'http://localhost:7054');
    this.set('BIOMETRIC_SERVICE_URL', process.env.REACT_APP_BIOMETRIC_SERVICE_URL || 'http://localhost:9090');
    this.set('SMS_SERVICE_URL', process.env.REACT_APP_SMS_SERVICE_URL || 'http://localhost:8081');

    // Feature Flags
    this.set('ENABLE_BIOMETRIC_AUTH', process.env.REACT_APP_ENABLE_BIOMETRIC_AUTH === 'true');
    this.set('ENABLE_MFA', process.env.REACT_APP_ENABLE_MFA === 'true');
    this.set('ENABLE_AUDIT_LOGGING', process.env.REACT_APP_ENABLE_AUDIT_LOGGING !== 'false');
    this.set('ENABLE_BLOCKCHAIN', process.env.REACT_APP_ENABLE_BLOCKCHAIN === 'true');
  }

  /**
   * Set default secure configurations
   */
  setDefaultConfig() {
    // Security defaults
    this.set('SECURE_COOKIES', process.env.NODE_ENV === 'production');
    this.set('CSRF_PROTECTION', true);
    this.set('CORS_ENABLED', true);
    this.set('HELMET_ENABLED', true);

    // Logging configuration
    this.set('LOG_LEVEL', process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
    this.set('LOG_MAX_FILES', 10);
    this.set('LOG_MAX_SIZE', '10m');

    // File upload limits
    this.set('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
    this.set('MAX_FILES_PER_UPLOAD', 5);
    this.set('ALLOWED_FILE_TYPES', ['image/jpeg', 'image/png', 'application/pdf']);

    // Performance settings
    this.set('CACHE_TTL', 300000); // 5 minutes
    this.set('REQUEST_TIMEOUT', 30000); // 30 seconds
    this.set('MAX_CONCURRENT_REQUESTS', 100);
  }

  /**
   * Validate configuration
   */
  validateConfiguration() {
    const validations = [
      {
        key: 'JWT_SECRET',
        validator: (value) => value && value.length >= 32,
        error: 'JWT_SECRET must be at least 32 characters'
      },
      {
        key: 'JWT_REFRESH_SECRET',
        validator: (value) => value && value.length >= 32,
        error: 'JWT_REFRESH_SECRET must be at least 32 characters'
      },
      {
        key: 'API_BASE_URL',
        validator: (value) => value && (value.startsWith('http://') || value.startsWith('https://')),
        error: 'API_BASE_URL must be a valid HTTP(S) URL'
      },
      {
        key: 'BCRYPT_ROUNDS',
        validator: (value) => value >= 10 && value <= 15,
        error: 'BCRYPT_ROUNDS must be between 10 and 15'
      }
    ];

    for (const validation of validations) {
      const value = this.get(validation.key);
      if (!validation.validator(value)) {
        throw new Error(validation.error);
      }
    }
  }

  /**
   * Generate secure random secret
   */
  generateSecureSecret(length = 64) {
    return CryptoJS.lib.WordArray.random(length/2).toString();
  }

  /**
   * Generate encryption key
   */
  generateEncryptionKey() {
    return CryptoJS.lib.WordArray.random(32).toString();
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
   * Get all configuration (for debugging - remove sensitive data)
   */
  getAll(includeSensitive = false) {
    const result = {};
    const sensitiveKeys = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'DB_PASSWORD'];
    
    for (const [key, value] of this.config.entries()) {
      if (!includeSensitive && sensitiveKeys.includes(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    try {
      const key = this.get('ENCRYPTION_KEY');
      const encrypted = CryptoJS.AES.encrypt(text, key).toString();
      
      return {
        encrypted,
        iv: 'browser-compat',
        authTag: 'browser-compat'
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    try {
      const key = this.get('ENCRYPTION_KEY');
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key).toString(CryptoJS.enc.Utf8);
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      database: this.get('DB_NAME'),
      ssl: this.get('DB_SSL'),
      // Add other DB config as needed
    };
  }

  /**
   * Get JWT configuration
   */
  getJWTConfig() {
    return {
      secret: this.get('JWT_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      accessExpiresIn: this.get('JWT_ACCESS_EXPIRY'),
      refreshExpiresIn: this.get('JWT_REFRESH_EXPIRY')
    };
  }

  /**
   * Get API configuration
   */
  getApiConfig() {
    return {
      baseURL: this.get('API_BASE_URL'),
      timeout: this.get('API_TIMEOUT'),
      retryAttempts: this.get('API_RETRY_ATTEMPTS')
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return {
      bcryptRounds: this.get('BCRYPT_ROUNDS'),
      sessionTimeout: this.get('SESSION_TIMEOUT'),
      rateLimitWindow: this.get('RATE_LIMIT_WINDOW'),
      rateLimitMaxRequests: this.get('RATE_LIMIT_MAX_REQUESTS'),
      enableBiometricAuth: this.get('ENABLE_BIOMETRIC_AUTH'),
      enableMFA: this.get('ENABLE_MFA'),
      enableAuditLogging: this.get('ENABLE_AUDIT_LOGGING')
    };
  }

  /**
   * Get external services configuration
   */
  getExternalServicesConfig() {
    return {
      blockchainEndpoint: this.get('BLOCKCHAIN_ENDPOINT'),
      biometricServiceUrl: this.get('BIOMETRIC_SERVICE_URL'),
      smsServiceUrl: this.get('SMS_SERVICE_URL')
    };
  }

  /**
   * Validate environment for production
   */
  validateProductionEnvironment() {
    const productionRequirements = [
      {
        condition: this.get('JWT_SECRET') !== this.get('JWT_REFRESH_SECRET'),
        error: 'JWT secrets must be different'
      },
      {
        condition: this.get('API_BASE_URL').startsWith('https://'),
        error: 'API_BASE_URL must use HTTPS in production'
      },
      {
        condition: this.get('BCRYPT_ROUNDS') >= 12,
        error: 'BCRYPT_ROUNDS should be at least 12 in production'
      },
      {
        condition: this.get('SECURE_COOKIES'),
        error: 'SECURE_COOKIES must be enabled in production'
      }
    ];

    const failures = productionRequirements.filter(req => !req.condition);
    
    if (failures.length > 0) {
      console.error('[CONFIG] Production validation failed:');
      failures.forEach(failure => console.error(`- ${failure.error}`));
      throw new Error('Production environment validation failed');
    }

    console.log('[CONFIG] Production environment validation passed');
  }

  /**
   * Health check for configuration
   */
  healthCheck() {
    try {
      // Check if critical configs are available
      const criticalConfigs = ['JWT_SECRET', 'API_BASE_URL', 'ENCRYPTION_KEY'];
      const missingConfigs = criticalConfigs.filter(key => !this.get(key));
      
      if (missingConfigs.length > 0) {
        return {
          status: 'unhealthy',
          error: `Missing critical configuration: ${missingConfigs.join(', ')}`
        };
      }

      // Test encryption/decryption
      const testData = 'health-check-test';
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      if (decrypted !== testData) {
        return {
          status: 'unhealthy',
          error: 'Encryption/decryption test failed'
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
const configManager = new ConfigManager();
export default configManager;
