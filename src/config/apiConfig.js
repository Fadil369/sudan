// Sudan Digital Identity System - API Configuration
// Production environment configuration for government API integrations

export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URLS: {
    development: 'https://dev-api.sudan.gov.sd/v1',
    staging: 'https://staging-api.sudan.gov.sd/v1',
    production: 'https://api.sudan.gov.sd/v1'
  },

  // Ministry-specific API endpoints
  MINISTRY_ENDPOINTS: {
    health: {
      baseUrl: 'https://health-api.sudan.gov.sd',
      version: 'v2',
      endpoints: {
        records: '/records',
        vaccinations: '/vaccinations',
        insurance: '/insurance',
        appointments: '/appointments',
        hospitals: '/hospitals',
        prescriptions: '/prescriptions'
      }
    },
    education: {
      baseUrl: 'https://education-api.sudan.gov.sd',
      version: 'v1',
      endpoints: {
        records: '/academic-records',
        certificates: '/certificates',
        institutions: '/institutions',
        enrollment: '/enrollment',
        transcripts: '/transcripts'
      }
    },
    interior: {
      baseUrl: 'https://interior-api.sudan.gov.sd',
      version: 'v2',
      endpoints: {
        identity: '/identity',
        passport: '/passport',
        criminalRecord: '/criminal-record',
        residency: '/residency',
        visa: '/visa',
        nationalService: '/national-service'
      }
    },
    finance: {
      baseUrl: 'https://finance-api.sudan.gov.sd',
      version: 'v1',
      endpoints: {
        taxRecords: '/tax-records',
        taxReturns: '/tax-returns',
        customs: '/customs',
        banking: '/banking-integration',
        payments: '/government-payments'
      }
    },
    energy: {
      baseUrl: 'https://energy-api.sudan.gov.sd',
      version: 'v1',
      endpoints: {
        consumption: '/consumption',
        billing: '/billing',
        connections: '/connections',
        outages: '/outages',
        renewable: '/renewable-permits'
      }
    },
    infrastructure: {
      baseUrl: 'https://infrastructure-api.sudan.gov.sd',
      version: 'v1',
      endpoints: {
        projects: '/projects',
        services: '/public-services',
        maintenance: '/maintenance-requests',
        permits: '/construction-permits'
      }
    },
    justice: {
      baseUrl: 'https://justice-api.sudan.gov.sd',
      version: 'v2',
      endpoints: {
        cases: '/legal-cases',
        applications: '/legal-applications',
        courts: '/courts',
        lawyers: '/lawyer-registry',
        mediation: '/mediation'
      }
    }
  },

  // External service integrations
  EXTERNAL_SERVICES: {
    centralBank: {
      baseUrl: 'https://api.cbos.gov.sd',
      version: 'v1',
      endpoints: {
        bankingInfo: '/banking-info',
        creditHistory: '/credit-history',
        exchangeRates: '/exchange-rates'
      }
    },
    nationalStatistics: {
      baseUrl: 'https://api.cbs.gov.sd',
      version: 'v1',
      endpoints: {
        census: '/census-data',
        demographics: '/demographics',
        statistics: '/national-statistics'
      }
    },
    sudanPost: {
      baseUrl: 'https://api.sudanpost.gov.sd',
      version: 'v1',
      endpoints: {
        addressVerification: '/address/verify',
        postalCodes: '/postal-codes',
        delivery: '/delivery-status'
      }
    },
    telecommunications: {
      baseUrl: 'https://api.telecom.gov.sd',
      version: 'v1',
      endpoints: {
        phoneVerification: '/phone/verify',
        operators: '/operators',
        coverage: '/network-coverage'
      }
    }
  },

  // Biometric service configuration
  BIOMETRIC_SERVICES: {
    baseUrl: 'https://biometric-api.sudan.gov.sd',
    version: 'v2',
    endpoints: {
      fingerprint: {
        upload: '/fingerprint/upload',
        verify: '/fingerprint/verify',
        match: '/fingerprint/match'
      },
      facial: {
        upload: '/facial/upload',
        verify: '/facial/verify',
        liveness: '/facial/liveness-check'
      },
      iris: {
        upload: '/iris/upload',
        verify: '/iris/verify'
      },
      voice: {
        upload: '/voice/upload',
        verify: '/voice/verify'
      }
    },
    supportedFormats: {
      fingerprint: ['WSQ', 'PNG', 'JPEG'],
      facial: ['JPEG', 'PNG'],
      iris: ['JPEG', 'PNG', 'BMP'],
      voice: ['WAV', 'MP3', 'AAC']
    },
    maxFileSizes: {
      fingerprint: 2 * 1024 * 1024, // 2MB
      facial: 5 * 1024 * 1024,      // 5MB
      iris: 3 * 1024 * 1024,        // 3MB
      voice: 10 * 1024 * 1024       // 10MB
    }
  },

  // Document management configuration
  DOCUMENT_SERVICES: {
    baseUrl: 'https://documents-api.sudan.gov.sd',
    version: 'v1',
    endpoints: {
      upload: '/documents/upload',
      download: '/documents/download',
      verify: '/documents/verify',
      digitize: '/documents/digitize',
      translate: '/documents/translate'
    },
    supportedTypes: [
      'PDF', 'JPEG', 'PNG', 'TIFF', 'DOC', 'DOCX'
    ],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    retentionPeriod: 365 * 10 // 10 years
  },

  // Blockchain integration
  BLOCKCHAIN_CONFIG: {
    network: 'sudan-identity-network',
    channel: 'sudan-identity-channel',
    chaincode: 'sudan-identity-chaincode',
    mspId: 'SudanGovMSP',
    endpoints: {
      peer: 'grpc://peer0.sudan-blockchain.gov.sd:7051',
      orderer: 'grpc://orderer.sudan-blockchain.gov.sd:7050',
      ca: 'https://ca.sudan-blockchain.gov.sd'
    }
  },

  // Security configuration
  SECURITY_CONFIG: {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyLength: 256
    },
    hashing: {
      algorithm: 'SHA-256'
    },
    jwt: {
      algorithm: 'RS256',
      expiresIn: '24h',
      refreshExpiresIn: '7d'
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
      skipSuccessfulRequests: true
    },
    cors: {
      origin: [
        'https://sudan-identity.gov.sd',
        'https://portal.sudan.gov.sd',
        'https://staging.sudan-identity.gov.sd'
      ]
    }
  },

  // Cache configuration
  CACHE_CONFIG: {
    redis: {
      host: process.env.REACT_APP_REDIS_HOST || 'redis.sudan.gov.sd',
      port: process.env.REACT_APP_REDIS_PORT || 6379,
      ttl: {
        shortTerm: 300,    // 5 minutes
        mediumTerm: 3600,  // 1 hour
        longTerm: 86400    // 24 hours
      }
    }
  },

  // Monitoring and observability
  MONITORING_CONFIG: {
    prometheus: {
      enabled: true,
      endpoint: '/metrics',
      labels: {
        service: 'sudan-identity-api',
        environment: process.env.NODE_ENV || 'development'
      }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      destinations: [
        'console',
        'file',
        'elasticsearch'
      ]
    },
    tracing: {
      jaeger: {
        endpoint: 'http://jaeger.sudan.gov.sd:14268/api/traces'
      }
    }
  },

  // Message queue configuration
  MESSAGING_CONFIG: {
    rabbitmq: {
      url: process.env.REACT_APP_RABBITMQ_URL || 'amqp://messaging.sudan.gov.sd',
      exchanges: {
        identity: 'sudan.identity.events',
        notifications: 'sudan.notifications',
        audit: 'sudan.audit.logs'
      },
      queues: {
        identityUpdates: 'identity.updates',
        notificationDelivery: 'notifications.delivery',
        auditProcessing: 'audit.processing'
      }
    }
  },

  // Notification services
  NOTIFICATION_CONFIG: {
    sms: {
      provider: 'sudan-telecom',
      endpoint: 'https://sms-api.sudan.gov.sd/v1',
      sender: 'SUDAN-GOV'
    },
    email: {
      provider: 'sudan-mail',
      endpoint: 'https://email-api.sudan.gov.sd/v1',
      sender: 'noreply@sudan.gov.sd'
    },
    push: {
      fcm: {
        serverKey: process.env.REACT_APP_FCM_SERVER_KEY,
        vapidKey: process.env.REACT_APP_FCM_VAPID_KEY
      }
    }
  },

  // Request/Response configuration
  REQUEST_CONFIG: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    retryDelayMultiplier: 2,
    maxRetryDelay: 30000, // 30 seconds
    headers: {
      'User-Agent': 'Sudan-Identity-Portal/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-Version': '1.0'
    }
  },

  // Feature flags
  FEATURE_FLAGS: {
    biometricAuth: true,
    blockchainAudit: true,
    realTimeChat: true,
    documentUpload: true,
    multilanguage: true,
    offlineMode: false, // To be enabled later
    mobileApp: false,   // Future feature
    aiAssistant: false  // Future feature
  },

  // Environment-specific settings
  ENVIRONMENT_CONFIG: {
    development: {
      debug: true,
      mockAPIs: true,
      detailedLogging: true
    },
    staging: {
      debug: true,
      mockAPIs: false,
      detailedLogging: true
    },
    production: {
      debug: false,
      mockAPIs: false,
      detailedLogging: false
    }
  }
};

// Helper functions
export const getAPIEndpoint = (ministry, endpoint) => {
  const config = API_CONFIG.MINISTRY_ENDPOINTS[ministry];
  if (!config) {
    throw new Error(`Unknown ministry: ${ministry}`);
  }
  return `${config.baseUrl}/${config.version}${config.endpoints[endpoint]}`;
};

export const getBiometricEndpoint = (type, action) => {
  const config = API_CONFIG.BIOMETRIC_SERVICES;
  return `${config.baseUrl}/${config.version}${config.endpoints[type][action]}`;
};

export const isFeatureEnabled = (feature) => {
  return API_CONFIG.FEATURE_FLAGS[feature] || false;
};

export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG.ENVIRONMENT_CONFIG[env];
};

export const getBaseURL = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG.BASE_URLS[env];
};

// Validation helpers
export const validateFileSize = (file, type) => {
  const maxSize = API_CONFIG.BIOMETRIC_SERVICES.maxFileSizes[type];
  return file.size <= maxSize;
};

export const validateFileType = (file, allowedTypes) => {
  const fileType = file.type.split('/')[1].toUpperCase();
  return allowedTypes.includes(fileType);
};

export default API_CONFIG;