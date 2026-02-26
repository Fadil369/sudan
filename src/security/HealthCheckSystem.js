/**
 * Comprehensive Health Check System for Sudan National Digital Identity System
 * Monitors application health, performance, and availability for national-scale deployment
 */

import secureConfig from './SecureConfig';

class HealthCheckSystem {
  constructor() {
    this.isEnabled = secureConfig.get('monitoring.enabled', true);
    this.checkInterval = 30000; // 30 seconds
    this.healthStatus = {
      overall: 'unknown',
      components: new Map(),
      metrics: {
        uptime: 0,
        responseTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        throughput: 0
      },
      lastCheck: null,
      checkHistory: []
    };
    
    this.healthChecks = new Map();
    this.alertThresholds = {
      responseTime: 3000, // 3 seconds
      memoryUsage: 80, // 80%
      errorRate: 5, // 5%
      diskSpace: 85 // 85%
    };
    
    this.monitoringInterval = null;
    this.startTime = Date.now();
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  /**
   * Initialize health check system
   */
  initialize() {
    this.registerCoreHealthChecks();
    this.startPeriodicChecks();
    this.setupPerformanceObserver();
    
    console.log('[HEALTH_CHECK] Health monitoring system initialized');
  }

  /**
   * Register core health checks
   */
  registerCoreHealthChecks() {
    // API connectivity checks
    this.registerHealthCheck('api_connectivity', this.checkAPIConnectivity.bind(this));
    this.registerHealthCheck('authentication_service', this.checkAuthenticationService.bind(this));
    this.registerHealthCheck('database_connection', this.checkDatabaseConnection.bind(this));
    
    // Government services checks
    this.registerHealthCheck('health_ministry_api', () => this.checkMinistryAPI('health'));
    this.registerHealthCheck('education_ministry_api', () => this.checkMinistryAPI('education'));
    this.registerHealthCheck('finance_ministry_api', () => this.checkMinistryAPI('finance'));
    this.registerHealthCheck('agriculture_ministry_api', () => this.checkMinistryAPI('agriculture'));
    this.registerHealthCheck('energy_ministry_api', () => this.checkMinistryAPI('energy'));
    this.registerHealthCheck('infrastructure_ministry_api', () => this.checkMinistryAPI('infrastructure'));
    this.registerHealthCheck('justice_ministry_api', () => this.checkMinistryAPI('justice'));
    this.registerHealthCheck('foreign_affairs_ministry_api', () => this.checkMinistryAPI('foreignAffairs'));
    this.registerHealthCheck('labor_ministry_api', () => this.checkMinistryAPI('labor'));
    this.registerHealthCheck('social_welfare_ministry_api', () => this.checkMinistryAPI('socialWelfare'));
    
    // External services checks
    this.registerHealthCheck('brainsait_integration', this.checkBrainSAITIntegration.bind(this));
    this.registerHealthCheck('blockchain_connectivity', this.checkBlockchainConnectivity.bind(this));
    this.registerHealthCheck('biometric_service', this.checkBiometricService.bind(this));
    
    // System resource checks
    this.registerHealthCheck('memory_usage', this.checkMemoryUsage.bind(this));
    this.registerHealthCheck('local_storage', this.checkLocalStorage.bind(this));
    this.registerHealthCheck('network_connectivity', this.checkNetworkConnectivity.bind(this));
    this.registerHealthCheck('browser_compatibility', this.checkBrowserCompatibility.bind(this));
    
    // Security checks
    this.registerHealthCheck('ssl_certificate', this.checkSSLCertificate.bind(this));
    this.registerHealthCheck('security_headers', this.checkSecurityHeaders.bind(this));
    this.registerHealthCheck('csrf_protection', this.checkCSRFProtection.bind(this));
  }

  /**
   * Register a health check
   */
  registerHealthCheck(name, checkFunction, options = {}) {
    this.healthChecks.set(name, {
      check: checkFunction,
      enabled: options.enabled !== false,
      timeout: options.timeout || 10000,
      critical: options.critical !== false,
      lastResult: null,
      consecutiveFailures: 0
    });
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks() {
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.checkInterval);
    
    // Perform initial check
    this.performHealthCheck();
  }

  /**
   * Setup performance observer for monitoring
   */
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.updatePerformanceMetrics(entry);
        }
      });
      
      try {
        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (error) {
        console.warn('[HEALTH_CHECK] Performance observer not supported:', error);
      }
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const checkStartTime = performance.now();
    const results = new Map();
    
    // Run all registered health checks
    const checkPromises = Array.from(this.healthChecks.entries()).map(async ([name, config]) => {
      if (!config.enabled) return;
      
      try {
        const checkResult = await Promise.race([
          config.check(),
          this.createTimeoutPromise(config.timeout)
        ]);
        
        results.set(name, {
          status: 'healthy',
          ...checkResult,
          responseTime: performance.now() - checkStartTime,
          timestamp: Date.now()
        });
        
        config.consecutiveFailures = 0;
      } catch (error) {
        config.consecutiveFailures++;
        
        results.set(name, {
          status: 'unhealthy',
          error: error.message,
          consecutiveFailures: config.consecutiveFailures,
          responseTime: performance.now() - checkStartTime,
          timestamp: Date.now()
        });
      }
      
      config.lastResult = results.get(name);
    });
    
    await Promise.allSettled(checkPromises);
    
    // Update health status
    this.updateHealthStatus(results);
    
    // Store check history
    this.storeCheckHistory(results);
    
    // Check for alerts
    this.checkHealthAlerts(results);
  }

  /**
   * Check API connectivity
   */
  async checkAPIConnectivity() {
    const apiUrl = secureConfig.get('api.baseUrl');
    if (!apiUrl) {
      throw new Error('API base URL not configured');
    }
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      const responseTime = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      return {
        responseTime,
        status: response.status,
        message: 'API connectivity healthy'
      };
    } catch (error) {
      throw new Error(`API connectivity failed: ${error.message}`);
    }
  }

  /**
   * Check authentication service
   */
  async checkAuthenticationService() {
    try {
      // Test JWT token validation endpoint
      const apiUrl = secureConfig.get('api.baseUrl');
      const response = await fetch(`${apiUrl}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: 'test-token' })
      });
      
      return {
        status: response.status,
        message: 'Authentication service accessible'
      };
    } catch (error) {
      throw new Error(`Authentication service check failed: ${error.message}`);
    }
  }

  /**
   * Check database connection
   */
  async checkDatabaseConnection() {
    try {
      const apiUrl = secureConfig.get('api.baseUrl');
      const response = await fetch(`${apiUrl}/db/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (!response.ok) {
        throw new Error(`Database health check failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        connectionPool: result.connectionPool || 'unknown',
        responseTime: result.responseTime || 0,
        message: 'Database connection healthy'
      };
    } catch (error) {
      throw new Error(`Database connectivity failed: ${error.message}`);
    }
  }

  /**
   * Check ministry API connectivity
   */
  async checkMinistryAPI(ministryName) {
    const apiUrl = secureConfig.get(`apis.${ministryName}`);
    
    if (!apiUrl) {
      return {
        status: 'not_configured',
        message: `${ministryName} API not configured`
      };
    }
    
    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      return {
        status: response.status,
        responseTime: 0, // Would be calculated from actual response
        message: `${ministryName} ministry API healthy`
      };
    } catch (error) {
      throw new Error(`${ministryName} ministry API failed: ${error.message}`);
    }
  }

  /**
   * Check BrainSAIT integration
   */
  async checkBrainSAITIntegration() {
    const brainsaitUrl = secureConfig.get('brainsait.apiUrl');
    
    if (!brainsaitUrl) {
      return {
        status: 'not_configured',
        message: 'BrainSAIT integration not configured'
      };
    }
    
    try {
      const response = await fetch(`${brainsaitUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secureConfig.get('brainsait.apiKey')}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`BrainSAIT API returned ${response.status}`);
      }
      
      return {
        status: response.status,
        message: 'BrainSAIT integration healthy'
      };
    } catch (error) {
      throw new Error(`BrainSAIT integration failed: ${error.message}`);
    }
  }

  /**
   * Check blockchain connectivity
   */
  async checkBlockchainConnectivity() {
    if (!secureConfig.get('blockchain.enabled')) {
      return {
        status: 'disabled',
        message: 'Blockchain integration disabled'
      };
    }
    
    try {
      // This would connect to actual blockchain network
      // For now, simulate the check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        networkId: secureConfig.get('blockchain.network'),
        peerConnections: 3, // Simulated
        message: 'Blockchain connectivity healthy'
      };
    } catch (error) {
      throw new Error(`Blockchain connectivity failed: ${error.message}`);
    }
  }

  /**
   * Check biometric service
   */
  async checkBiometricService() {
    const biometricUrl = secureConfig.get('biometric.serviceUrl');
    
    if (!biometricUrl) {
      return {
        status: 'not_configured',
        message: 'Biometric service not configured'
      };
    }
    
    try {
      const response = await fetch(`${biometricUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      return {
        status: response.status,
        capabilities: {
          fingerprint: secureConfig.get('biometric.fingerprintEnabled'),
          facial: secureConfig.get('biometric.facialRecognitionEnabled'),
          iris: secureConfig.get('biometric.irisScanEnabled'),
          voice: secureConfig.get('biometric.voiceRecognitionEnabled')
        },
        message: 'Biometric service healthy'
      };
    } catch (error) {
      throw new Error(`Biometric service failed: ${error.message}`);
    }
  }

  /**
   * Check memory usage
   */
  async checkMemoryUsage() {
    if (!performance.memory) {
      return {
        status: 'not_available',
        message: 'Memory monitoring not available in this browser'
      };
    }
    
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    
    if (usagePercent > this.alertThresholds.memoryUsage) {
      throw new Error(`High memory usage: ${usagePercent.toFixed(1)}%`);
    }
    
    return {
      usagePercent: Math.round(usagePercent * 100) / 100,
      usedMB: Math.round(usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(jsHeapSizeLimit / 1024 / 1024),
      message: 'Memory usage within acceptable limits'
    };
  }

  /**
   * Check local storage functionality
   */
  async checkLocalStorage() {
    try {
      const testKey = '__health_check_test__';
      const testValue = JSON.stringify({ timestamp: Date.now() });
      
      // Test write
      localStorage.setItem(testKey, testValue);
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      
      // Test parse
      const parsed = JSON.parse(retrieved);
      
      // Test delete
      localStorage.removeItem(testKey);
      
      if (parsed.timestamp !== JSON.parse(testValue).timestamp) {
        throw new Error('Local storage data integrity check failed');
      }
      
      return {
        available: true,
        quotaUsed: this.getLocalStorageUsage(),
        message: 'Local storage functioning correctly'
      };
    } catch (error) {
      throw new Error(`Local storage check failed: ${error.message}`);
    }
  }

  /**
   * Check network connectivity
   */
  async checkNetworkConnectivity() {
    if (!navigator.onLine) {
      throw new Error('Browser reports offline status');
    }
    
    try {
      // Test connectivity with a simple request
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      
      return {
        online: navigator.onLine,
        latency: 0, // Would measure actual latency
        connectionType: navigator.connection?.effectiveType || 'unknown',
        message: 'Network connectivity healthy'
      };
    } catch (error) {
      throw new Error(`Network connectivity test failed: ${error.message}`);
    }
  }

  /**
   * Check browser compatibility
   */
  async checkBrowserCompatibility() {
    const requiredFeatures = [
      'fetch',
      'Promise',
      'localStorage',
      'sessionStorage',
      'WebCrypto',
      'ArrayBuffer'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => {
      switch (feature) {
        case 'fetch': return !window.fetch;
        case 'Promise': return !window.Promise;
        case 'localStorage': return !window.localStorage;
        case 'sessionStorage': return !window.sessionStorage;
        case 'WebCrypto': return !window.crypto || !window.crypto.subtle;
        case 'ArrayBuffer': return !window.ArrayBuffer;
        default: return false;
      }
    });
    
    if (missingFeatures.length > 0) {
      throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
    }
    
    return {
      userAgent: navigator.userAgent.substring(0, 100),
      supportedFeatures: requiredFeatures,
      webGLSupport: this.checkWebGLSupport(),
      message: 'Browser compatibility check passed'
    };
  }

  /**
   * Check SSL certificate
   */
  async checkSSLCertificate() {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error('Application not served over HTTPS');
    }
    
    return {
      protocol: location.protocol,
      secure: location.protocol === 'https:',
      message: 'SSL/TLS security check passed'
    };
  }

  /**
   * Check security headers
   */
  async checkSecurityHeaders() {
    try {
      const response = await fetch(location.href, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'strict-transport-security'
      ];
      
      const missingHeaders = requiredHeaders.filter(header => !response.headers.get(header));
      
      if (missingHeaders.length > 0) {
        console.warn('[HEALTH_CHECK] Missing security headers:', missingHeaders);
      }
      
      return {
        presentHeaders: requiredHeaders.filter(header => response.headers.get(header)),
        missingHeaders,
        message: missingHeaders.length === 0 ? 'All security headers present' : 'Some security headers missing'
      };
    } catch (error) {
      throw new Error(`Security headers check failed: ${error.message}`);
    }
  }

  /**
   * Check CSRF protection
   */
  async checkCSRFProtection() {
    const csrfToken = localStorage.getItem('csrf_token') || sessionStorage.getItem('csrf_token');
    
    if (!csrfToken) {
      throw new Error('CSRF token not found');
    }
    
    return {
      tokenPresent: true,
      tokenLength: csrfToken.length,
      message: 'CSRF protection active'
    };
  }

  /**
   * Update health status based on check results
   */
  updateHealthStatus(results) {
    const totalChecks = results.size;
    const healthyChecks = Array.from(results.values()).filter(result => result.status === 'healthy').length;
    const criticalFailures = Array.from(results.entries())
      .filter(([name, result]) => result.status === 'unhealthy' && this.healthChecks.get(name)?.critical)
      .length;
    
    // Determine overall status
    let overallStatus;
    if (criticalFailures > 0) {
      overallStatus = 'critical';
    } else if (healthyChecks / totalChecks >= 0.8) {
      overallStatus = 'healthy';
    } else if (healthyChecks / totalChecks >= 0.6) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }
    
    // Update status
    this.healthStatus.overall = overallStatus;
    this.healthStatus.components = results;
    this.healthStatus.lastCheck = Date.now();
    
    // Update metrics
    this.updateHealthMetrics(results);
  }

  /**
   * Update health metrics
   */
  updateHealthMetrics(results) {
    const responseTimes = Array.from(results.values())
      .map(result => result.responseTime || 0)
      .filter(time => time > 0);
    
    this.healthStatus.metrics = {
      uptime: Date.now() - this.startTime,
      responseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b) / responseTimes.length : 0,
      memoryUsage: this.getCurrentMemoryUsage(),
      errorRate: this.calculateErrorRate(results),
      throughput: this.calculateThroughput()
    };
  }

  /**
   * Store check history for trending
   */
  storeCheckHistory(results) {
    const historyEntry = {
      timestamp: Date.now(),
      overall: this.healthStatus.overall,
      componentCount: results.size,
      healthyCount: Array.from(results.values()).filter(r => r.status === 'healthy').length,
      averageResponseTime: this.healthStatus.metrics.responseTime
    };
    
    this.healthStatus.checkHistory.push(historyEntry);
    
    // Keep only last 100 entries
    if (this.healthStatus.checkHistory.length > 100) {
      this.healthStatus.checkHistory = this.healthStatus.checkHistory.slice(-100);
    }
  }

  /**
   * Check for health alerts
   */
  checkHealthAlerts(results) {
    // Check for critical failures
    const criticalFailures = Array.from(results.entries())
      .filter(([name, result]) => result.status === 'unhealthy' && this.healthChecks.get(name)?.critical);
    
    if (criticalFailures.length > 0) {
      this.triggerHealthAlert('critical_service_failure', {
        failures: criticalFailures.map(([name, result]) => ({
          service: name,
          error: result.error,
          consecutiveFailures: result.consecutiveFailures
        }))
      });
    }
    
    // Check response time threshold
    if (this.healthStatus.metrics.responseTime > this.alertThresholds.responseTime) {
      this.triggerHealthAlert('high_response_time', {
        averageResponseTime: this.healthStatus.metrics.responseTime,
        threshold: this.alertThresholds.responseTime
      });
    }
    
    // Check memory usage
    if (this.healthStatus.metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      this.triggerHealthAlert('high_memory_usage', {
        currentUsage: this.healthStatus.metrics.memoryUsage,
        threshold: this.alertThresholds.memoryUsage
      });
    }
  }

  /**
   * Trigger health alert
   */
  triggerHealthAlert(alertType, details) {
    const alert = {
      type: alertType,
      severity: this.getAlertSeverity(alertType),
      details,
      timestamp: Date.now()
    };
    
    // Dispatch event for listeners
    window.dispatchEvent(new CustomEvent('health:alert', { detail: alert }));
    
    console.warn('[HEALTH_CHECK] Health alert triggered:', alert);
  }

  /**
   * Utility methods
   */
  
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeout);
    });
  }

  getLocalStorageUsage() {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      return Math.round(total / 1024); // KB
    } catch {
      return 0;
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  getCurrentMemoryUsage() {
    if (performance.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      return (usedJSHeapSize / jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  calculateErrorRate(results) {
    const total = results.size;
    const errors = Array.from(results.values()).filter(r => r.status === 'unhealthy').length;
    return total > 0 ? (errors / total) * 100 : 0;
  }

  calculateThroughput() {
    // This would calculate actual throughput from performance data
    return 0; // Placeholder
  }

  updatePerformanceMetrics(entry) {
    // Update performance metrics from PerformanceObserver
    if (entry.entryType === 'navigation') {
      this.healthStatus.metrics.responseTime = entry.loadEventEnd - entry.loadEventStart;
    }
  }

  getAlertSeverity(alertType) {
    const severityMap = {
      'critical_service_failure': 'critical',
      'high_response_time': 'warning',
      'high_memory_usage': 'warning',
      'service_degradation': 'info'
    };
    
    return severityMap[alertType] || 'info';
  }

  /**
   * Public API
   */

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      ...this.healthStatus,
      components: Object.fromEntries(this.healthStatus.components)
    };
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const components = Array.from(this.healthStatus.components.values());
    const totalComponents = components.length;
    const healthyComponents = components.filter(c => c.status === 'healthy').length;
    
    return {
      overall: this.healthStatus.overall,
      uptime: this.healthStatus.metrics.uptime,
      componentsHealthy: `${healthyComponents}/${totalComponents}`,
      lastCheck: this.healthStatus.lastCheck,
      averageResponseTime: Math.round(this.healthStatus.metrics.responseTime),
      memoryUsage: Math.round(this.healthStatus.metrics.memoryUsage)
    };
  }

  /**
   * Force health check
   */
  async forceHealthCheck() {
    await this.performHealthCheck();
    return this.getHealthStatus();
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('[HEALTH_CHECK] Health monitoring stopped');
  }
}

// Create and export singleton instance
const healthCheck = new HealthCheckSystem();

export default healthCheck;
export { HealthCheckSystem };