/**
 * Enhanced Cloudflare Deployment Configuration
 * Optimized for Sudan National Digital Identity System
 */

// Environment-specific configurations
const environments = {
  development: {
    name: 'development',
    api: {
      baseUrl: 'http://localhost:8080/api',
      timeout: 30000,
      retries: 3
    },
    security: {
      enforceHttps: false,
      csrfEnabled: true,
      rateLimitEnabled: false
    },
    performance: {
      cacheEnabled: false,
      compressionEnabled: false,
      bundleAnalyzer: true
    },
    monitoring: {
      errorReporting: false,
      analytics: false,
      performanceMonitoring: false
    }
  },
  
  staging: {
    name: 'staging',
    api: {
      baseUrl: 'https://staging-api.sd.brainsait.com/api',
      timeout: 30000,
      retries: 3
    },
    security: {
      enforceHttps: true,
      csrfEnabled: true,
      rateLimitEnabled: true
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      bundleAnalyzer: false
    },
    monitoring: {
      errorReporting: true,
      analytics: false,
      performanceMonitoring: true
    }
  },
  
  production: {
    name: 'production',
    api: {
      baseUrl: 'https://api.sd.brainsait.com/api',
      timeout: 30000,
      retries: 5
    },
    security: {
      enforceHttps: true,
      csrfEnabled: true,
      rateLimitEnabled: true,
      maxLoginAttempts: 5,
      sessionTimeout: 1800
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      bundleAnalyzer: false,
      maxConcurrentUsers: 50000000
    },
    monitoring: {
      errorReporting: true,
      analytics: true,
      performanceMonitoring: true
    }
  }
};

// Cloudflare specific configurations
const cloudflareConfig = {
  zones: {
    primary: {
      zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
      domain: 'sd.brainsait.com'
    },
    cdn: {
      zoneId: process.env.CLOUDFLARE_CDN_ZONE_ID || '',
      domain: 'cdn.sd.brainsait.com'
    }
  },
  
  workers: {
    routes: [
      { pattern: 'sd.brainsait.com/api/*', worker: 'sudan-api-worker' },
      { pattern: 'sd.brainsait.com/auth/*', worker: 'sudan-auth-worker' },
      { pattern: 'sd.brainsait.com/biometric/*', worker: 'sudan-biometric-worker' },
      { pattern: 'sd.brainsait.com/blockchain/*', worker: 'sudan-blockchain-worker' }
    ],
    
    kvNamespaces: {
      sessions: 'SUDAN_SESSIONS',
      cache: 'SUDAN_CACHE',
      config: 'SUDAN_CONFIG',
      audit: 'SUDAN_AUDIT'
    },
    
    durableObjects: {
      realTimeUpdates: 'SudanRealTimeUpdates',
      sessionManager: 'SudanSessionManager',
      rateLimiter: 'SudanRateLimiter'
    }
  },
  
  pages: {
    project: 'sudan-digital-identity',
    production: {
      branch: 'main',
      buildCommand: 'npm run build:production',
      buildOutput: 'build',
      environmentVariables: {
        NODE_ENV: 'production',
        REACT_APP_ENVIRONMENT: 'production'
      }
    },
    preview: {
      branch: 'develop',
      buildCommand: 'npm run build',
      buildOutput: 'build'
    }
  },
  
  r2: {
    buckets: {
      documents: 'sudan-documents',
      backups: 'sudan-backups',
      logs: 'sudan-logs',
      media: 'sudan-media'
    }
  },
  
  d1: {
    databases: {
      identity: 'sudan-identity-db',
      audit: 'sudan-audit-db',
      sessions: 'sudan-sessions-db'
    }
  }
};

// Security configurations for Cloudflare
const securityConfig = {
  waf: {
    rules: [
      {
        action: 'block',
        expression: '(cf.threat_score gt 30)',
        description: 'Block high threat score requests'
      },
      {
        action: 'challenge',
        expression: '(http.request.uri.path contains "/admin")',
        description: 'Challenge admin panel access'
      },
      {
        action: 'block',
        expression: '(rate(5m) gt 100)',
        description: 'Rate limiting: 100 requests per 5 minutes'
      }
    ]
  },
  
  ssl: {
    mode: 'full_strict',
    minimumTlsVersion: '1.2',
    cipherSuites: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-CHACHA20-POLY1305'
    ],
    hstsEnabled: true,
    hstsMaxAge: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: true
  },
  
  ddos: {
    sensitivity: 'high',
    thresholds: {
      l7: 1000,
      l4: 10000
    }
  },
  
  bot: {
    fightMode: 'on',
    allowVerifiedBots: true,
    whitelist: [
      'Google',
      'Bing',
      'DuckDuckGo'
    ]
  }
};

// Performance optimization configurations
const performanceConfig = {
  caching: {
    browser: {
      '*.js': 86400, // 1 day
      '*.css': 86400, // 1 day
      '*.png': 604800, // 1 week
      '*.jpg': 604800, // 1 week
      '*.svg': 604800, // 1 week
      '*.woff2': 2592000, // 30 days
      '/api/*': 0 // No cache for API
    },
    
    edge: {
      html: 300, // 5 minutes
      api: 0, // No cache
      static: 2592000 // 30 days
    }
  },
  
  compression: {
    brotli: true,
    gzip: true,
    minify: {
      html: true,
      css: true,
      js: true
    }
  },
  
  optimization: {
    mirage: true,
    polish: 'lossless',
    webp: true,
    avif: false,
    rocket: true
  }
};

// Monitoring and analytics configurations
const monitoringConfig = {
  analytics: {
    webVitals: true,
    javascript: true,
    performance: true,
    security: true
  },
  
  alerts: {
    errorRate: {
      threshold: 5, // 5%
      timeWindow: 300 // 5 minutes
    },
    responseTime: {
      threshold: 5000, // 5 seconds
      timeWindow: 300
    },
    availability: {
      threshold: 99.9,
      timeWindow: 3600 // 1 hour
    }
  },
  
  logging: {
    level: 'info',
    destinations: [
      'cloudflare-logpush',
      'external-siem'
    ],
    retention: {
      days: 90,
      archiveDays: 2555 // 7 years for compliance
    }
  }
};

// Geographic distribution configurations
const geoConfig = {
  regions: {
    primary: 'africa-northeast', // Closest to Sudan
    secondary: [
      'europe-west',
      'middle-east',
      'africa-west'
    ]
  },
  
  routing: {
    strategy: 'latency',
    failover: {
      enabled: true,
      healthChecks: true,
      retries: 3
    }
  },
  
  localization: {
    arabic: {
      regions: ['middle-east', 'africa-northeast'],
      priority: 'high'
    },
    english: {
      regions: ['global'],
      priority: 'medium'
    }
  }
};

// Integration configurations
const integrationConfig = {
  government: {
    ministries: {
      health: {
        endpoint: 'https://health.sd.brainsait.com/api',
        timeout: 10000,
        retries: 3
      },
      education: {
        endpoint: 'https://education.sd.brainsait.com/api',
        timeout: 10000,
        retries: 3
      },
      finance: {
        endpoint: 'https://finance.sd.brainsait.com/api',
        timeout: 10000,
        retries: 3
      }
      // Additional ministries...
    }
  },
  
  external: {
    brainsait: {
      endpoint: 'https://api.brainsait.com/v1',
      timeout: 15000,
      retries: 5
    },
    blockchain: {
      network: 'hyperledger-fabric',
      timeout: 30000,
      retries: 3
    }
  },
  
  biometric: {
    providers: {
      primary: {
        endpoint: 'https://biometric.sd.brainsait.com/api',
        timeout: 20000,
        retries: 3
      }
    }
  }
};

// Export configuration factory
function getConfig(environment = 'production') {
  const env = environments[environment] || environments.production;
  
  return {
    environment: env,
    cloudflare: cloudflareConfig,
    security: securityConfig,
    performance: performanceConfig,
    monitoring: monitoringConfig,
    geography: geoConfig,
    integrations: integrationConfig,
    
    // Helper methods
    getApiUrl: (service = '') => {
      const baseUrl = env.api.baseUrl;
      return service ? `${baseUrl}/${service}` : baseUrl;
    },
    
    getMinistryApiUrl: (ministry) => {
      return integrationConfig.government.ministries[ministry]?.endpoint;
    },
    
    isProduction: () => environment === 'production',
    isDevelopment: () => environment === 'development',
    isStaging: () => environment === 'staging',
    
    getSecurityLevel: () => {
      return environment === 'production' ? 'high' : 'medium';
    },
    
    getCacheSettings: (resourceType) => {
      return performanceConfig.caching.browser[resourceType] || 0;
    },
    
    getMonitoringConfig: () => {
      return monitoringConfig;
    }
  };
}

// Export configurations
module.exports = {
  getConfig,
  environments,
  cloudflareConfig,
  securityConfig,
  performanceConfig,
  monitoringConfig,
  geoConfig,
  integrationConfig
};

// ES6 export for modern bundlers
export {
  getConfig,
  environments,
  cloudflareConfig,
  securityConfig,
  performanceConfig,
  monitoringConfig,
  geoConfig,
  integrationConfig
};

export default getConfig;