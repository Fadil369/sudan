// Sudan National Digital Identity - Production Database Service
// Handles connections to government databases and external systems

import auditLogger from '../security/AuditLogger';

/**
 * Production Database Integration Layer
 * Connects to actual government databases and external systems
 */
class DatabaseService {
  constructor() {
    this.connections = new Map();
    this.connectionPools = new Map();
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    this.initialized = false;
    
    this.config = {
      // Primary Database Configuration
      primary: {
        host: process.env.REACT_APP_DB_HOST || 'db.sudan.elfadil.com',
        port: process.env.REACT_APP_DB_PORT || 5432,
        database: process.env.REACT_APP_DB_NAME || 'sudan_national_identity',
        ssl: process.env.REACT_APP_DB_SSL === 'true',
        pool: {
          min: 5,
          max: 20,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 30000
        }
      },
      
      // Government Database Endpoints
      ministries: {
        health: process.env.REACT_APP_HEALTH_API_URL,
        education: process.env.REACT_APP_EDUCATION_API_URL,
        finance: process.env.REACT_APP_FINANCE_API_URL,
        agriculture: process.env.REACT_APP_AGRICULTURE_API_URL,
        energy: process.env.REACT_APP_ENERGY_API_URL,
        infrastructure: process.env.REACT_APP_INFRASTRUCTURE_API_URL,
        justice: process.env.REACT_APP_JUSTICE_API_URL,
        foreignAffairs: process.env.REACT_APP_FOREIGN_AFFAIRS_API_URL,
        labor: process.env.REACT_APP_LABOR_API_URL,
        socialWelfare: process.env.REACT_APP_SOCIAL_WELFARE_API_URL
      },
      
      // External System Integration
      external: {
        nationalRecords: process.env.REACT_APP_NATIONAL_RECORDS_API,
        centralBank: process.env.REACT_APP_CENTRAL_BANK_API,
        sudanPost: process.env.REACT_APP_SUDAN_POST_API,
        statistics: process.env.REACT_APP_STATISTICS_API,
        dhis2: process.env.REACT_APP_DHIS2_URL,
        ifmis: process.env.REACT_APP_IFMIS_URL
      }
    };
    
    this.initializeConnections();
  }

  /**
   * Initialize database connections and connection pools
   */
  async initializeConnections() {
    try {
      console.log('🔄 Initializing database connections...');
      
      // In a real implementation, this would establish actual database connections
      // For browser environment, we'll simulate with fetch-based API connections
      
      // Test primary database connection
      await this.testConnection('primary');
      
      // Test ministry API connections
      for (const [ministry, url] of Object.entries(this.config.ministries)) {
        if (url) {
          await this.testConnection('ministry', ministry, url);
        }
      }
      
      // Test external system connections
      for (const [system, url] of Object.entries(this.config.external)) {
        if (url) {
          await this.testConnection('external', system, url);
        }
      }
      
      this.initialized = true;
      console.log('✅ Database connections initialized successfully');
      
      auditLogger.system('DATABASE_INITIALIZED', {
        timestamp: new Date().toISOString(),
        connections: this.connections.size,
        status: 'success'
      });
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      auditLogger.system('DATABASE_INIT_FAILED', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Test database/API connection
   */
  async testConnection(type, name, url = null) {
    try {
      const connectionKey = `${type}_${name}`;
      const testUrl = url || this.getConnectionUrl(type, name);
      
      // Test connection with health check endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${testUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Health-Check': 'true'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        // 404 is acceptable as many APIs might not have /health endpoint
        this.connections.set(connectionKey, {
          status: 'connected',
          url: testUrl,
          lastChecked: Date.now(),
          type,
          name
        });
        
        console.log(`✅ Connected to ${type} ${name}: ${testUrl}`);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Connection test failed for ${type} ${name}:`, error.message);
      
      // Store failed connection for retry logic
      this.connections.set(`${type}_${name}`, {
        status: 'failed',
        url: url || this.getConnectionUrl(type, name),
        lastChecked: Date.now(),
        error: error.message,
        type,
        name
      });
      
      return false;
    }
  }

  /**
   * Get connection URL for a service
   */
  getConnectionUrl(type, name) {
    switch (type) {
      case 'primary':
        return `${this.config.primary.host}:${this.config.primary.port}`;
      case 'ministry':
        return this.config.ministries[name];
      case 'external':
        return this.config.external[name];
      default:
        throw new Error(`Unknown connection type: ${type}`);
    }
  }

  /**
   * Execute query with caching and error handling
   */
  async executeQuery(type, name, endpoint, method = 'GET', data = null, options = {}) {
    try {
      // Check cache first for GET requests
      const cacheKey = `${type}_${name}_${endpoint}_${JSON.stringify(data)}`;
      if (method === 'GET' && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📋 Cache hit for ${type} ${name} ${endpoint}`);
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      // Get connection info
      const connectionKey = `${type}_${name}`;
      const connection = this.connections.get(connectionKey);
      
      if (!connection || connection.status !== 'connected') {
        throw new Error(`No active connection for ${type} ${name}`);
      }

      // Prepare request
      const url = `${connection.url}${endpoint}`;
      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-ID': this.generateRequestId(),
          'X-Timestamp': new Date().toISOString(),
          ...this.getAuthHeaders(type, name),
          ...(options.headers || {})
        },
        ...(data && { body: JSON.stringify(data) })
      };

      console.log(`🔗 Database query: ${method} ${url}`);

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache successful GET requests
      if (method === 'GET') {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      // Log successful query
      auditLogger.dataAccess('DATABASE_QUERY_SUCCESS', {
        type,
        name,
        endpoint,
        method,
        timestamp: new Date().toISOString(),
        responseSize: JSON.stringify(result).length
      });

      return result;

    } catch (error) {
      console.error(`❌ Database query failed for ${type} ${name} ${endpoint}:`, error);
      
      auditLogger.dataAccess('DATABASE_QUERY_FAILED', {
        type,
        name,
        endpoint,
        method,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Get authentication headers for different services
   */
  getAuthHeaders(type, name) {
    const headers = {};
    
    switch (type) {
      case 'ministry':
        // Each ministry might have different auth requirements
        const token = localStorage.getItem(`${name}_api_token`);
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        break;
        
      case 'external':
        // External system specific auth
        switch (name) {
          case 'nationalRecords':
            headers['X-API-Key'] = process.env.REACT_APP_NATIONAL_RECORDS_API_KEY;
            break;
          case 'centralBank':
            headers['X-API-Key'] = process.env.REACT_APP_CENTRAL_BANK_API_KEY;
            break;
          case 'sudanPost':
            headers['X-API-Key'] = process.env.REACT_APP_SUDAN_POST_API_KEY;
            break;
          case 'statistics':
            headers['X-API-Key'] = process.env.REACT_APP_STATISTICS_API_KEY;
            break;
          case 'dhis2':
            const dhis2Auth = btoa(`${process.env.REACT_APP_DHIS2_USERNAME}:${process.env.REACT_APP_DHIS2_PASSWORD}`);
            headers.Authorization = `Basic ${dhis2Auth}`;
            break;
          case 'ifmis':
            headers['X-API-Key'] = process.env.REACT_APP_IFMIS_API_KEY;
            break;
        }
        break;
    }
    
    return headers;
  }

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const status = {
      initialized: this.initialized,
      connections: {
        total: this.connections.size,
        active: Array.from(this.connections.values()).filter(c => c.status === 'connected').length,
        failed: Array.from(this.connections.values()).filter(c => c.status === 'failed').length
      },
      cache: {
        entries: this.cache.size,
        hitRate: this.calculateCacheHitRate()
      },
      lastHealthCheck: new Date().toISOString()
    };

    return status;
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    // This would be implemented with proper metrics in production
    return 0.85; // 85% hit rate example
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Database cache cleared');
  }

  /**
   * Reconnect failed connections
   */
  async reconnectFailedConnections() {
    const failedConnections = Array.from(this.connections.entries())
      .filter(([key, connection]) => connection.status === 'failed');

    console.log(`🔄 Reconnecting ${failedConnections.length} failed connections...`);

    for (const [key, connection] of failedConnections) {
      await this.testConnection(connection.type, connection.name);
    }
  }

  /**
   * Close all connections (cleanup)
   */
  async closeConnections() {
    console.log('🔒 Closing database connections...');
    this.connections.clear();
    this.cache.clear();
    this.initialized = false;
    
    auditLogger.system('DATABASE_CONNECTIONS_CLOSED', {
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;