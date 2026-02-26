/**
 * Advanced Security Monitoring Service for Sudan National Digital Identity System
 * Provides real-time security monitoring, threat detection, and automated incident response
 */

import secureConfig from './SecureConfig';
import { AuditLogger } from './AuditLogger';

class SecurityMonitoringService {
  constructor() {
    this.isEnabled = secureConfig.get('monitoring.enabled', true);
    this.alertThresholds = {
      failedLogins: 5,
      suspiciousActivity: 3,
      apiErrors: 10,
      responseTime: 5000
    };
    
    this.securityMetrics = {
      failedLoginAttempts: new Map(),
      suspiciousActivities: new Map(),
      blockedIPs: new Set(),
      activeThreats: new Map(),
      securityEvents: []
    };

    this.alertCallbacks = new Set();
    this.monitoringInterval = null;
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  /**
   * Initialize security monitoring
   */
  initialize() {
    this.startRealTimeMonitoring();
    this.setupEventListeners();
    this.initializeThreatDetection();
    
    console.log('[SECURITY_MONITOR] Security monitoring service initialized');
  }

  /**
   * Start real-time monitoring
   */
  startRealTimeMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performSecurityCheck();
      this.analyzeSecurityMetrics();
      this.cleanupOldEvents();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup event listeners for security monitoring
   */
  setupEventListeners() {
    // Monitor authentication events
    window.addEventListener('security:login_attempt', (event) => {
      this.handleLoginAttempt(event.detail);
    });

    window.addEventListener('security:login_failed', (event) => {
      this.handleFailedLogin(event.detail);
    });

    window.addEventListener('security:suspicious_activity', (event) => {
      this.handleSuspiciousActivity(event.detail);
    });

    window.addEventListener('security:api_error', (event) => {
      this.handleApiError(event.detail);
    });

    // Monitor navigation and user behavior
    window.addEventListener('beforeunload', () => {
      this.logEvent('session_end', { timestamp: Date.now() });
    });
  }

  /**
   * Initialize threat detection systems
   */
  initializeThreatDetection() {
    // Initialize browser fingerprinting for device tracking
    this.deviceFingerprint = this.generateDeviceFingerprint();
    
    // Setup rate limiting monitoring
    this.setupRateLimitMonitoring();
    
    // Initialize geolocation anomaly detection
    this.setupGeolocationMonitoring();
  }

  /**
   * Handle login attempt monitoring
   */
  handleLoginAttempt(details) {
    const { username, ip, userAgent, timestamp } = details;
    
    // Log the attempt
    this.logEvent('login_attempt', {
      username: this.hashSensitiveData(username),
      ip: this.maskIP(ip),
      userAgent: this.sanitizeUserAgent(userAgent),
      timestamp,
      deviceFingerprint: this.deviceFingerprint
    });

    // Check for suspicious patterns
    this.checkSuspiciousLoginPattern(username, ip);
  }

  /**
   * Handle failed login monitoring
   */
  handleFailedLogin(details) {
    const { username, ip, reason, timestamp } = details;
    
    // Increment failed login counter
    const key = `${username}:${ip}`;
    const currentCount = this.securityMetrics.failedLoginAttempts.get(key) || 0;
    this.securityMetrics.failedLoginAttempts.set(key, currentCount + 1);

    // Log the failed attempt
    this.logEvent('login_failed', {
      username: this.hashSensitiveData(username),
      ip: this.maskIP(ip),
      reason,
      timestamp,
      attemptCount: currentCount + 1
    });

    // Check if threshold exceeded
    if (currentCount + 1 >= this.alertThresholds.failedLogins) {
      this.triggerSecurityAlert('excessive_failed_logins', {
        username: this.hashSensitiveData(username),
        ip: this.maskIP(ip),
        attempts: currentCount + 1,
        timeWindow: '1 hour'
      });

      // Consider blocking IP
      this.considerIPBlocking(ip, 'excessive_failed_logins');
    }
  }

  /**
   * Handle suspicious activity detection
   */
  handleSuspiciousActivity(details) {
    const { type, severity, metadata, timestamp } = details;
    
    this.logEvent('suspicious_activity', {
      type,
      severity,
      metadata: this.sanitizeMetadata(metadata),
      timestamp,
      deviceFingerprint: this.deviceFingerprint
    });

    // Track suspicious activities
    const activityKey = `${type}:${metadata?.ip || 'unknown'}`;
    const currentCount = this.securityMetrics.suspiciousActivities.get(activityKey) || 0;
    this.securityMetrics.suspiciousActivities.set(activityKey, currentCount + 1);

    // Trigger alerts based on severity
    if (severity === 'high' || currentCount + 1 >= this.alertThresholds.suspiciousActivity) {
      this.triggerSecurityAlert('suspicious_activity_detected', {
        type,
        severity,
        occurrences: currentCount + 1,
        metadata: this.sanitizeMetadata(metadata)
      });
    }
  }

  /**
   * Handle API error monitoring
   */
  handleApiError(details) {
    const { endpoint, status, error, timestamp } = details;
    
    this.logEvent('api_error', {
      endpoint: this.sanitizeEndpoint(endpoint),
      status,
      error: this.sanitizeError(error),
      timestamp
    });

    // Check for potential attacks
    if (status === 401 || status === 403) {
      this.handleSuspiciousActivity({
        type: 'unauthorized_api_access',
        severity: 'medium',
        metadata: { endpoint, status },
        timestamp
      });
    }
  }

  /**
   * Perform comprehensive security check
   */
  performSecurityCheck() {
    const checks = [
      this.checkMemoryUsage(),
      this.checkNetworkConnectivity(),
      this.checkLocalStorageIntegrity(),
      this.checkCSRFTokens(),
      this.checkSessionValidity()
    ];

    const failures = checks.filter(check => !check.passed);
    
    if (failures.length > 0) {
      this.triggerSecurityAlert('security_check_failed', {
        failedChecks: failures.map(f => f.check),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check memory usage for potential memory-based attacks
   */
  checkMemoryUsage() {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const memoryUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
      
      if (memoryUsagePercent > 80) {
        return { 
          passed: false, 
          check: 'memory_usage',
          details: { memoryUsagePercent, usedMB: Math.round(usedJSHeapSize / 1024 / 1024) }
        };
      }
    }
    
    return { passed: true, check: 'memory_usage' };
  }

  /**
   * Check network connectivity and potential network-based attacks
   */
  checkNetworkConnectivity() {
    if (!navigator.onLine) {
      return { 
        passed: false, 
        check: 'network_connectivity',
        details: { online: false }
      };
    }
    
    return { passed: true, check: 'network_connectivity' };
  }

  /**
   * Check local storage integrity
   */
  checkLocalStorageIntegrity() {
    try {
      const testKey = '__security_test__';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        return { 
          passed: false, 
          check: 'localstorage_integrity',
          details: { expected: testValue, received: retrieved }
        };
      }
    } catch (error) {
      return { 
        passed: false, 
        check: 'localstorage_integrity',
        details: { error: error.message }
      };
    }
    
    return { passed: true, check: 'localstorage_integrity' };
  }

  /**
   * Check CSRF token validity
   */
  checkCSRFTokens() {
    const csrfToken = this.getCSRFToken();
    
    if (!csrfToken || this.isCSRFTokenExpired(csrfToken)) {
      return { 
        passed: false, 
        check: 'csrf_token',
        details: { hasToken: !!csrfToken, expired: this.isCSRFTokenExpired(csrfToken) }
      };
    }
    
    return { passed: true, check: 'csrf_token' };
  }

  /**
   * Check session validity
   */
  checkSessionValidity() {
    const sessionData = this.getSessionData();
    
    if (!sessionData || this.isSessionExpired(sessionData)) {
      return { 
        passed: false, 
        check: 'session_validity',
        details: { hasSession: !!sessionData, expired: this.isSessionExpired(sessionData) }
      };
    }
    
    return { passed: true, check: 'session_validity' };
  }

  /**
   * Generate device fingerprint for tracking
   */
  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Sudan Digital Identity System', 2, 2);
    
    const fingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      canvas: canvas.toDataURL(),
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
    };
    
    return btoa(JSON.stringify(fingerprint)).substring(0, 32);
  }

  /**
   * Setup rate limiting monitoring
   */
  setupRateLimitMonitoring() {
    this.rateLimitCounters = new Map();
    
    // Monitor API calls
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const url = args[0];
      const now = Date.now();
      const minute = Math.floor(now / 60000);
      const key = `${url}:${minute}`;
      
      const currentCount = this.rateLimitCounters.get(key) || 0;
      this.rateLimitCounters.set(key, currentCount + 1);
      
      // Check rate limits
      if (currentCount + 1 > secureConfig.get('api.rateLimit', 1000)) {
        this.triggerSecurityAlert('rate_limit_exceeded', {
          url: this.sanitizeEndpoint(url),
          requestsPerMinute: currentCount + 1,
          timestamp: now
        });
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Setup geolocation monitoring
   */
  setupGeolocationMonitoring() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.logEvent('geolocation_detected', {
            latitude: Math.round(position.coords.latitude * 100) / 100, // Rounded for privacy
            longitude: Math.round(position.coords.longitude * 100) / 100,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          this.logEvent('geolocation_error', {
            error: error.message,
            timestamp: Date.now()
          });
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    }
  }

  /**
   * Trigger security alert
   */
  triggerSecurityAlert(alertType, details) {
    const alert = {
      id: this.generateAlertId(),
      type: alertType,
      severity: this.getAlertSeverity(alertType),
      details,
      timestamp: Date.now(),
      resolved: false
    };

    // Log the alert
    AuditLogger.logSecurityEvent('security_alert', alert);
    
    // Store active threat
    this.securityMetrics.activeThreats.set(alert.id, alert);
    
    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[SECURITY_MONITOR] Alert callback error:', error);
      }
    });

    // Auto-response for critical alerts
    if (alert.severity === 'critical') {
      this.executeAutomaticResponse(alert);
    }
  }

  /**
   * Execute automatic response to critical security threats
   */
  executeAutomaticResponse(alert) {
    switch (alert.type) {
      case 'excessive_failed_logins':
        this.temporarilyBlockIP(alert.details.ip);
        break;
      case 'rate_limit_exceeded':
        this.enforceRateLimit(alert.details.url);
        break;
      case 'suspicious_activity_detected':
        this.enhanceSecurityMode();
        break;
      default:
        console.warn('[SECURITY_MONITOR] No automatic response configured for:', alert.type);
    }
  }

  /**
   * Consider blocking IP address
   */
  considerIPBlocking(ip, reason) {
    if (this.shouldBlockIP(ip, reason)) {
      this.temporarilyBlockIP(ip);
    }
  }

  /**
   * Temporarily block IP address
   */
  temporarilyBlockIP(ip) {
    this.securityMetrics.blockedIPs.add(ip);
    
    // Remove block after 1 hour
    setTimeout(() => {
      this.securityMetrics.blockedIPs.delete(ip);
      this.logEvent('ip_unblocked', { ip: this.maskIP(ip), timestamp: Date.now() });
    }, 3600000);
    
    this.logEvent('ip_blocked', { ip: this.maskIP(ip), timestamp: Date.now() });
  }

  /**
   * Check if IP should be blocked
   */
  shouldBlockIP(ip, reason) {
    // Don't block local IPs
    if (ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return false;
    }
    
    // Block based on reason and severity
    const blockingReasons = ['excessive_failed_logins', 'brute_force_attack', 'malicious_activity'];
    return blockingReasons.includes(reason);
  }

  /**
   * Enhance security mode (additional protections)
   */
  enhanceSecurityMode() {
    // Reduce session timeout
    const reducedTimeout = Math.min(secureConfig.get('security.sessionTimeout') / 2, 900);
    
    // Enable additional monitoring
    this.alertThresholds.failedLogins = Math.max(this.alertThresholds.failedLogins - 2, 2);
    this.alertThresholds.suspiciousActivity = Math.max(this.alertThresholds.suspiciousActivity - 1, 1);
    
    // Log security mode enhancement
    this.logEvent('security_mode_enhanced', {
      reducedTimeout,
      enhancedThresholds: this.alertThresholds,
      timestamp: Date.now()
    });
    
    // Reset after 30 minutes
    setTimeout(() => {
      this.resetSecurityMode();
    }, 1800000);
  }

  /**
   * Reset security mode to normal
   */
  resetSecurityMode() {
    this.alertThresholds = {
      failedLogins: 5,
      suspiciousActivity: 3,
      apiErrors: 10,
      responseTime: 5000
    };
    
    this.logEvent('security_mode_reset', { timestamp: Date.now() });
  }

  /**
   * Analyze security metrics for patterns
   */
  analyzeSecurityMetrics() {
    this.analyzeFailedLoginPatterns();
    this.analyzeSuspiciousActivityPatterns();
    this.analyzeResponseTimePatterns();
  }

  /**
   * Analyze failed login patterns
   */
  analyzeFailedLoginPatterns() {
    const now = Date.now();
    const oneHour = 3600000;
    
    // Check for distributed attacks
    const recentFailures = Array.from(this.securityMetrics.failedLoginAttempts.entries())
      .filter(([key, count]) => {
        // This is simplified - in reality, you'd track timestamps
        return count > 2;
      });
    
    if (recentFailures.length > 10) {
      this.triggerSecurityAlert('distributed_attack_detected', {
        affectedAccounts: recentFailures.length,
        timestamp: now
      });
    }
  }

  /**
   * Analyze suspicious activity patterns
   */
  analyzeSuspiciousActivityPatterns() {
    const activities = Array.from(this.securityMetrics.suspiciousActivities.entries());
    
    // Look for coordinated attacks
    const coordinatedPattern = activities.filter(([key, count]) => count > 5);
    
    if (coordinatedPattern.length > 0) {
      this.triggerSecurityAlert('coordinated_attack_detected', {
        patterns: coordinatedPattern.map(([key]) => key.split(':')[0]),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Analyze response time patterns
   */
  analyzeResponseTimePatterns() {
    // This would integrate with performance monitoring
    const avgResponseTime = this.calculateAverageResponseTime();
    
    if (avgResponseTime > this.alertThresholds.responseTime) {
      this.triggerSecurityAlert('performance_degradation', {
        averageResponseTime: avgResponseTime,
        threshold: this.alertThresholds.responseTime,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Clean up old security events
   */
  cleanupOldEvents() {
    const oneHour = 3600000;
    const cutoffTime = Date.now() - oneHour;
    
    // Clean up failed login attempts
    for (const [key, timestamp] of this.securityMetrics.failedLoginAttempts.entries()) {
      if (timestamp < cutoffTime) {
        this.securityMetrics.failedLoginAttempts.delete(key);
      }
    }
    
    // Clean up suspicious activities
    for (const [key, timestamp] of this.securityMetrics.suspiciousActivities.entries()) {
      if (timestamp < cutoffTime) {
        this.securityMetrics.suspiciousActivities.delete(key);
      }
    }
    
    // Clean up security events
    this.securityMetrics.securityEvents = this.securityMetrics.securityEvents
      .filter(event => event.timestamp > cutoffTime);
  }

  /**
   * Utility functions for data sanitization and security
   */
  
  hashSensitiveData(data) {
    if (!data) return null;
    // Simple hash for demonstration - use proper cryptographic hash in production
    return btoa(data).substring(0, 8) + '...';
  }

  maskIP(ip) {
    if (!ip) return null;
    const parts = ip.split('.');
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.xxx.xxx` : 'masked';
  }

  sanitizeUserAgent(userAgent) {
    if (!userAgent) return null;
    return userAgent.substring(0, 50) + (userAgent.length > 50 ? '...' : '');
  }

  sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return metadata;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  sanitizeEndpoint(endpoint) {
    if (!endpoint) return null;
    // Remove query parameters that might contain sensitive data
    return endpoint.split('?')[0];
  }

  sanitizeError(error) {
    if (!error) return null;
    if (typeof error === 'string') {
      return error.substring(0, 200);
    }
    return error.message ? error.message.substring(0, 200) : 'Unknown error';
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getAlertSeverity(alertType) {
    const severityMap = {
      'excessive_failed_logins': 'high',
      'distributed_attack_detected': 'critical',
      'coordinated_attack_detected': 'critical',
      'suspicious_activity_detected': 'medium',
      'rate_limit_exceeded': 'medium',
      'security_check_failed': 'high',
      'performance_degradation': 'low'
    };
    
    return severityMap[alertType] || 'medium';
  }

  logEvent(eventType, details) {
    const event = {
      type: eventType,
      details,
      timestamp: Date.now()
    };
    
    this.securityMetrics.securityEvents.push(event);
    
    // Use audit logger for persistent logging
    AuditLogger.logSecurityEvent(eventType, details);
  }

  // Placeholder methods that would integrate with actual systems
  getCSRFToken() {
    return localStorage.getItem('csrf_token');
  }

  isCSRFTokenExpired(token) {
    // Check token expiration logic
    return false;
  }

  getSessionData() {
    return localStorage.getItem('session_data');
  }

  isSessionExpired(sessionData) {
    // Check session expiration logic
    return false;
  }

  calculateAverageResponseTime() {
    // Would integrate with performance monitoring
    return 1000; // placeholder
  }

  enforceRateLimit(url) {
    console.log(`[SECURITY_MONITOR] Enforcing rate limit for: ${url}`);
  }

  /**
   * Public API methods
   */

  /**
   * Register alert callback
   */
  onAlert(callback) {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  /**
   * Get current security status
   */
  getSecurityStatus() {
    return {
      monitoring: this.isEnabled,
      activeThreats: this.securityMetrics.activeThreats.size,
      blockedIPs: this.securityMetrics.blockedIPs.size,
      recentEvents: this.securityMetrics.securityEvents.slice(-10),
      deviceFingerprint: this.deviceFingerprint
    };
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics() {
    return {
      failedLoginAttempts: this.securityMetrics.failedLoginAttempts.size,
      suspiciousActivities: this.securityMetrics.suspiciousActivities.size,
      blockedIPs: this.securityMetrics.blockedIPs.size,
      activeThreats: this.securityMetrics.activeThreats.size,
      totalEvents: this.securityMetrics.securityEvents.length
    };
  }

  /**
   * Manually trigger security event
   */
  reportSecurityEvent(type, details) {
    window.dispatchEvent(new CustomEvent(`security:${type}`, { detail: details }));
  }

  /**
   * Stop security monitoring
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.alertCallbacks.clear();
    console.log('[SECURITY_MONITOR] Security monitoring stopped');
  }
}

// Create and export singleton instance
const securityMonitor = new SecurityMonitoringService();

export default securityMonitor;
export { SecurityMonitoringService };