// Sudan National Digital Identity - Production Monitoring Service
// Real-time system monitoring, analytics, and performance tracking

import auditLogger from '../security/AuditLogger';

/**
 * Production Monitoring and Analytics Service
 * Tracks system performance, user behavior, and government service usage
 */
class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.performanceData = new Map();
    this.userAnalytics = new Map();
    this.governmentAnalytics = new Map();
    
    this.config = {
      monitoring: {
        enabled: process.env.REACT_APP_MONITORING_ENABLED === 'true',
        interval: 30000, // 30 seconds
        performanceSampling: 0.1, // 10% sampling rate
        errorTracking: true,
        userTracking: process.env.REACT_APP_USER_TRACKING_ENABLED === 'true'
      },
      
      thresholds: {
        responseTime: 2000, // 2 seconds
        errorRate: 0.05, // 5%
        cpuUsage: 80, // 80%
        memoryUsage: 90, // 90%
        concurrentUsers: 50000000, // 50M users
        apiRequestsPerMinute: 100000
      },
      
      alerts: {
        email: process.env.REACT_APP_ALERT_EMAIL,
        webhook: process.env.REACT_APP_ALERT_WEBHOOK,
        sms: process.env.REACT_APP_ALERT_SMS
      }
    };
    
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.activeUsers = new Set();
    
    if (this.config.monitoring.enabled) {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize monitoring systems
   */
  initializeMonitoring() {
    console.log('📊 Initializing production monitoring...');
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Start user analytics
    this.startUserAnalytics();
    
    // Start government service analytics
    this.startGovernmentAnalytics();
    
    // Start health checks
    this.startHealthChecks();
    
    // Set up error tracking
    this.setupErrorTracking();
    
    console.log('✅ Monitoring initialized successfully');
    
    auditLogger.system('MONITORING_INITIALIZED', {
      timestamp: new Date().toISOString(),
      config: this.config.monitoring
    });
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor page load times
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      this.recordMetric('page_load_time', loadTime);
    }

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.recordAPIMetric(url, response.status, responseTime);
        this.requestCount++;
        
        if (response.status >= 400) {
          this.errorCount++;
          this.recordError('API_ERROR', {
            url,
            status: response.status,
            responseTime
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.errorCount++;
        this.recordError('API_FETCH_ERROR', {
          url,
          error: error.message,
          responseTime
        });
        
        throw error;
      }
    };

    // Performance observer for detailed metrics
    if (window.PerformanceObserver) {
      try {
        const perfObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordPerformanceEntry(entry);
          });
        });
        
        perfObserver.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  /**
   * Start user analytics
   */
  startUserAnalytics() {
    // Track active users
    this.trackActiveUser();
    
    // Track user interactions
    this.setupUserInteractionTracking();
    
    // Track session duration
    this.trackSessionDuration();
    
    // Geographic analytics
    this.trackUserGeography();
  }

  /**
   * Start government service analytics
   */
  startGovernmentAnalytics() {
    // Track service usage by ministry
    this.trackServiceUsage();
    
    // Track application submissions
    this.trackApplicationSubmissions();
    
    // Track citizen satisfaction
    this.trackCitizenSatisfaction();
    
    // Track efficiency metrics
    this.trackEfficiencyMetrics();
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoring.interval);
  }

  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordError('JAVASCRIPT_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('UNHANDLED_REJECTION', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Record performance metric
   */
  recordMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    const metricKey = `${name}_${timestamp}`;
    
    this.metrics.set(metricKey, {
      name,
      value,
      timestamp,
      tags
    });

    // Check thresholds and create alerts if needed
    this.checkThresholds(name, value);
    
    // Clean old metrics (keep last hour)
    this.cleanOldMetrics();
  }

  /**
   * Record API performance metric
   */
  recordAPIMetric(url, status, responseTime) {
    this.recordMetric('api_response_time', responseTime, {
      url: this.sanitizeUrl(url),
      status,
      timestamp: new Date().toISOString()
    });

    // Track API success rate
    const isSuccess = status >= 200 && status < 400;
    this.recordMetric('api_success', isSuccess ? 1 : 0, {
      url: this.sanitizeUrl(url),
      status
    });
  }

  /**
   * Record performance entry from Performance Observer
   */
  recordPerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.recordMetric('navigation_timing', entry.duration, {
          type: 'navigation',
          name: entry.name
        });
        break;
        
      case 'resource':
        this.recordMetric('resource_timing', entry.duration, {
          type: 'resource',
          name: entry.name,
          size: entry.transferSize
        });
        break;
        
      case 'measure':
        this.recordMetric('custom_measure', entry.duration, {
          type: 'measure',
          name: entry.name
        });
        break;
    }
  }

  /**
   * Record error with context
   */
  recordError(type, details) {
    const error = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    auditLogger.system('ERROR_RECORDED', error);
    
    // Send to error tracking service if configured
    this.sendErrorToService(error);
  }

  /**
   * Track active user
   */
  trackActiveUser() {
    const userId = this.getUserId();
    const sessionId = this.getSessionId();
    
    this.activeUsers.add(sessionId);
    
    // Track user session
    this.recordMetric('active_users', this.activeUsers.size);
    
    auditLogger.auth('USER_ACTIVE', {
      userId,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Setup user interaction tracking
   */
  setupUserInteractionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      if (Math.random() < this.config.monitoring.performanceSampling) {
        this.recordMetric('user_click', 1, {
          element: event.target.tagName,
          id: event.target.id,
          className: event.target.className
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.recordMetric('form_submission', 1, {
        formId: event.target.id,
        formAction: event.target.action
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordMetric('page_visibility', document.hidden ? 0 : 1);
    });
  }

  /**
   * Track session duration
   */
  trackSessionDuration() {
    const sessionStart = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart;
      this.recordMetric('session_duration', sessionDuration);
    });
  }

  /**
   * Track user geography (if geolocation available)
   */
  trackUserGeography() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.recordMetric('user_location', 1, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Geolocation not available:', error.message);
        }
      );
    }
  }

  /**
   * Track service usage by ministry
   */
  trackServiceUsage() {
    // This would be called by ministry components
    window.trackMinistryUsage = (ministryName, serviceType) => {
      this.recordMetric('ministry_service_usage', 1, {
        ministry: ministryName,
        service: serviceType,
        userId: this.getUserId()
      });

      // Track in government analytics
      const key = `ministry_${ministryName}_${serviceType}`;
      const current = this.governmentAnalytics.get(key) || 0;
      this.governmentAnalytics.set(key, current + 1);
    };
  }

  /**
   * Track application submissions
   */
  trackApplicationSubmissions() {
    window.trackApplicationSubmission = (ministryName, applicationType, status) => {
      this.recordMetric('application_submission', 1, {
        ministry: ministryName,
        type: applicationType,
        status,
        userId: this.getUserId()
      });

      auditLogger.dataAccess('APPLICATION_TRACKED', {
        ministry: ministryName,
        type: applicationType,
        status,
        timestamp: new Date().toISOString()
      });
    };
  }

  /**
   * Track citizen satisfaction
   */
  trackCitizenSatisfaction() {
    window.trackSatisfaction = (rating, feedback, context) => {
      this.recordMetric('citizen_satisfaction', rating, {
        feedback: feedback?.substring(0, 100), // Limit feedback length
        context,
        userId: this.getUserId()
      });
    };
  }

  /**
   * Track efficiency metrics
   */
  trackEfficiencyMetrics() {
    window.trackProcessingTime = (processName, startTime, endTime) => {
      const processingTime = endTime - startTime;
      this.recordMetric('process_efficiency', processingTime, {
        process: processName,
        userId: this.getUserId()
      });
    };
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      activeUsers: this.activeUsers.size,
      memoryUsage: this.getMemoryUsage(),
      performance: this.getPerformanceMetrics()
    };

    // Check for alerts
    this.checkHealthAlerts(health);

    return health;
  }

  /**
   * Check thresholds and create alerts
   */
  checkThresholds(metricName, value) {
    const thresholds = this.config.thresholds;
    let alertTriggered = false;

    switch (metricName) {
      case 'api_response_time':
        if (value > thresholds.responseTime) {
          this.createAlert('HIGH_RESPONSE_TIME', `API response time ${value}ms exceeds threshold ${thresholds.responseTime}ms`);
          alertTriggered = true;
        }
        break;
        
      case 'active_users':
        if (value > thresholds.concurrentUsers) {
          this.createAlert('HIGH_USER_LOAD', `Active users ${value} exceeds threshold ${thresholds.concurrentUsers}`);
          alertTriggered = true;
        }
        break;
    }

    if (alertTriggered) {
      auditLogger.system('ALERT_TRIGGERED', {
        metric: metricName,
        value,
        threshold: thresholds[metricName],
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check health alerts
   */
  checkHealthAlerts(health) {
    if (health.errorRate > this.config.thresholds.errorRate) {
      this.createAlert('HIGH_ERROR_RATE', `Error rate ${(health.errorRate * 100).toFixed(2)}% exceeds threshold`);
    }

    if (health.memoryUsage > this.config.thresholds.memoryUsage) {
      this.createAlert('HIGH_MEMORY_USAGE', `Memory usage ${health.memoryUsage}% exceeds threshold`);
    }
  }

  /**
   * Create alert
   */
  createAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    };

    this.alerts.set(`${type}_${Date.now()}`, alert);
    
    // Send alert notifications
    this.sendAlertNotifications(alert);
    
    console.warn(`🚨 ALERT: ${type} - ${message}`);
  }

  /**
   * Get alert severity
   */
  getAlertSeverity(type) {
    const severityMap = {
      'HIGH_RESPONSE_TIME': 'warning',
      'HIGH_USER_LOAD': 'critical',
      'HIGH_ERROR_RATE': 'critical',
      'HIGH_MEMORY_USAGE': 'warning'
    };
    
    return severityMap[type] || 'info';
  }

  /**
   * Send alert notifications
   */
  async sendAlertNotifications(alert) {
    // In production, this would send emails, SMS, webhook notifications
    if (this.config.alerts.webhook) {
      try {
        await fetch(this.config.alerts.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
    }
    return 0;
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics() {
    const recentMetrics = Array.from(this.metrics.values())
      .filter(m => Date.now() - m.timestamp < 300000); // Last 5 minutes
    
    const apiMetrics = recentMetrics.filter(m => m.name === 'api_response_time');
    const avgResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
      : 0;

    return {
      averageResponseTime: Math.round(avgResponseTime),
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
    };
  }

  /**
   * Clean old metrics to prevent memory leaks
   */
  cleanOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.timestamp < oneHourAgo) {
        this.metrics.delete(key);
      }
    }
  }

  /**
   * Utility methods
   */
  sanitizeUrl(url) {
    // Remove sensitive parameters from URL for logging
    return url.replace(/([?&])(token|key|password|secret)=[^&]*/gi, '$1$2=***');
  }

  getUserId() {
    return localStorage.getItem('currentCitizenOid') || 'anonymous';
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('sudan-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sudan-session-id', sessionId);
    }
    return sessionId;
  }

  async sendErrorToService(error) {
    // Send error to external error tracking service
    const errorService = process.env.REACT_APP_ERROR_REPORTING_URL;
    if (errorService) {
      try {
        await fetch(errorService, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });
      } catch (sendError) {
        console.error('Failed to send error to service:', sendError);
      }
    }
  }

  /**
   * Export analytics data
   */
  exportAnalytics(timeRange = '24h') {
    const analytics = {
      timeRange,
      exportTime: new Date().toISOString(),
      metrics: Array.from(this.metrics.values()),
      alerts: Array.from(this.alerts.values()),
      governmentAnalytics: Object.fromEntries(this.governmentAnalytics),
      summary: this.getAnalyticsSummary()
    };

    return analytics;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      uptime: Date.now() - this.startTime,
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      activeUsers: this.activeUsers.size,
      alertsCount: this.alerts.size,
      performanceMetrics: this.getPerformanceMetrics()
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;