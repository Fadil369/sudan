import winston from 'winston';
import configManager from './ConfigManager.js';

/**
 * Comprehensive Audit Logging System
 * Tracks security events, user actions, and system activities
 */

class AuditLogger {
  constructor() {
    this.initializeLogger();
    this.eventBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.startBufferFlush();
  }

  /**
   * Initialize Winston logger with multiple transports
   */
  initializeLogger() {
    // Create different log formats
    const securityFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level: level.toUpperCase(),
          event: message,
          ...meta,
          signature: this.generateLogSignature({ timestamp, level, message, ...meta })
        });
      })
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
        return `[${timestamp}] ${level}: ${message} ${metaStr}`;
      })
    );

    // Configure transports
    const transports = [
      // Console transport for development
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
      })
    ];

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        // Security audit log
        new winston.transports.File({
          filename: '/var/log/sudan-portal/security.log',
          format: securityFormat,
          level: 'info',
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          tailable: true
        }),
        
        // Error log
        new winston.transports.File({
          filename: '/var/log/sudan-portal/error.log',
          format: securityFormat,
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        
        // Combined log
        new winston.transports.File({
          filename: '/var/log/sudan-portal/combined.log',
          format: securityFormat,
          maxsize: 50485760, // 50MB
          maxFiles: 20,
          tailable: true
        })
      );
    }

    this.logger = winston.createLogger({
      level: configManager.get('LOG_LEVEL', 'info'),
      transports,
      exitOnError: false,
      // Handle uncaught exceptions and rejections
      exceptionHandlers: [
        new winston.transports.File({ filename: '/var/log/sudan-portal/exceptions.log' })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: '/var/log/sudan-portal/rejections.log' })
      ]
    });
  }

  /**
   * Generate cryptographic signature for log integrity
   */
  generateLogSignature(logData) {
    try {
      const crypto = require('crypto');
      const logString = JSON.stringify(logData);
      const secret = configManager.get('ENCRYPTION_KEY');
      return crypto.createHmac('sha256', secret).update(logString).digest('hex');
    } catch (error) {
      return 'signature_error';
    }
  }

  /**
   * Start buffer flush mechanism
   */
  startBufferFlush() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  /**
   * Flush buffered events
   */
  flushBuffer() {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    // Send to external logging service in production
    this.sendToExternalService(events);
  }

  /**
   * Send logs to external service
   */
  async sendToExternalService(events) {
    // In production, implement sending to SIEM or log aggregation service
    console.log(`[AUDIT] Flushing ${events.length} events to external service`);
  }

  /**
   * Core logging method
   */
  log(level, event, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      event,
      sessionId: this.getCurrentSessionId(),
      requestId: this.getCurrentRequestId(),
      userAgent: this.getUserAgent(),
      ipAddress: this.getClientIP(),
      ...details
    };

    // Add to buffer for batch processing
    this.eventBuffer.push(logEntry);
    
    // Flush buffer if full
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }

    // Log immediately with Winston
    this.logger.log(level, event, logEntry);
  }

  /**
   * Authentication Events
   */
  logAuthentication(event, details) {
    this.log('info', `AUTH_${event}`, {
      category: 'authentication',
      sensitivity: 'high',
      ...details
    });
  }

  logLoginSuccess(userId, username, role, additionalDetails = {}) {
    this.logAuthentication('LOGIN_SUCCESS', {
      userId,
      username,
      role,
      loginMethod: 'password',
      ...additionalDetails
    });
  }

  logLoginFailure(username, reason, additionalDetails = {}) {
    this.logAuthentication('LOGIN_FAILURE', {
      username,
      reason,
      ...additionalDetails
    });
  }

  logLogout(userId, username, sessionDuration) {
    this.logAuthentication('LOGOUT', {
      userId,
      username,
      sessionDuration
    });
  }

  logPasswordChange(userId, username) {
    this.logAuthentication('PASSWORD_CHANGE', {
      userId,
      username
    });
  }

  logBiometricAuth(userId, username, success, method) {
    this.logAuthentication('BIOMETRIC_AUTH', {
      userId,
      username,
      success,
      method,
      sensitivity: 'high'
    });
  }

  /**
   * Authorization Events
   */
  logAuthorization(event, details) {
    this.log('info', `AUTHZ_${event}`, {
      category: 'authorization',
      sensitivity: 'high',
      ...details
    });
  }

  logAccessGranted(userId, username, resource, permission) {
    this.logAuthorization('ACCESS_GRANTED', {
      userId,
      username,
      resource,
      permission
    });
  }

  logAccessDenied(userId, username, resource, permission, reason) {
    this.logAuthorization('ACCESS_DENIED', {
      userId,
      username,
      resource,
      permission,
      reason,
      severity: 'warning'
    });
  }

  logPrivilegeEscalation(userId, username, oldRole, newRole, authorizedBy) {
    this.logAuthorization('PRIVILEGE_ESCALATION', {
      userId,
      username,
      oldRole,
      newRole,
      authorizedBy,
      severity: 'critical'
    });
  }

  /**
   * Data Access Events
   */
  logDataAccess(event, details) {
    this.log('info', `DATA_${event}`, {
      category: 'data_access',
      sensitivity: 'medium',
      ...details
    });
  }

  logDataRead(userId, username, dataType, recordId, ministryId) {
    this.logDataAccess('READ', {
      userId,
      username,
      dataType,
      recordId,
      ministryId
    });
  }

  logDataWrite(userId, username, dataType, recordId, operation, ministryId) {
    this.logDataAccess('WRITE', {
      userId,
      username,
      dataType,
      recordId,
      operation, // 'create', 'update', 'delete'
      ministryId,
      sensitivity: 'high'
    });
  }

  logSensitiveDataAccess(userId, username, dataType, recordId, reason) {
    this.logDataAccess('SENSITIVE_ACCESS', {
      userId,
      username,
      dataType,
      recordId,
      reason,
      sensitivity: 'critical'
    });
  }

  /**
   * System Events
   */
  logSystemEvent(event, details) {
    this.log('info', `SYSTEM_${event}`, {
      category: 'system',
      sensitivity: 'medium',
      ...details
    });
  }

  logConfigChange(userId, username, configKey, oldValue, newValue) {
    this.logSystemEvent('CONFIG_CHANGE', {
      userId,
      username,
      configKey,
      oldValue: this.sanitizeValue(oldValue),
      newValue: this.sanitizeValue(newValue),
      sensitivity: 'high'
    });
  }

  logSystemStartup(version, environment) {
    this.logSystemEvent('STARTUP', {
      version,
      environment,
      nodeVersion: process.version,
      platform: process.platform
    });
  }

  logSystemShutdown(reason, uptime) {
    this.logSystemEvent('SHUTDOWN', {
      reason,
      uptime
    });
  }

  /**
   * Security Events
   */
  logSecurityEvent(event, details) {
    this.log('warn', `SECURITY_${event}`, {
      category: 'security',
      sensitivity: 'critical',
      ...details
    });
  }

  logSecurityThreat(threatType, details, severity = 'high') {
    this.logSecurityEvent('THREAT_DETECTED', {
      threatType,
      severity,
      ...details
    });
  }

  logRateLimitExceeded(ipAddress, endpoint, requestCount) {
    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ipAddress,
      endpoint,
      requestCount,
      severity: 'medium'
    });
  }

  logSuspiciousActivity(userId, username, activityType, details) {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      userId,
      username,
      activityType,
      severity: 'high',
      ...details
    });
  }

  logBruteForceAttempt(ipAddress, username, attemptCount) {
    this.logSecurityEvent('BRUTE_FORCE_ATTEMPT', {
      ipAddress,
      username,
      attemptCount,
      severity: 'critical'
    });
  }

  /**
   * Application Events
   */
  logApplicationEvent(event, details) {
    this.log('info', `APP_${event}`, {
      category: 'application',
      sensitivity: 'low',
      ...details
    });
  }

  logError(error, context = {}) {
    this.log('error', 'APPLICATION_ERROR', {
      errorMessage: error.message,
      errorName: error.name,
      errorStack: this.sanitizeStackTrace(error.stack),
      category: 'error',
      sensitivity: 'medium',
      ...context
    });
  }

  logApiCall(method, endpoint, statusCode, duration, userId = null) {
    this.logApplicationEvent('API_CALL', {
      method,
      endpoint,
      statusCode,
      duration,
      userId
    });
  }

  /**
   * File and Document Events
   */
  logFileEvent(event, details) {
    this.log('info', `FILE_${event}`, {
      category: 'file_operations',
      sensitivity: 'medium',
      ...details
    });
  }

  logFileUpload(userId, username, fileName, fileSize, fileType, ministryId) {
    this.logFileEvent('UPLOAD', {
      userId,
      username,
      fileName,
      fileSize,
      fileType,
      ministryId
    });
  }

  logFileDownload(userId, username, fileName, ministryId) {
    this.logFileEvent('DOWNLOAD', {
      userId,
      username,
      fileName,
      ministryId
    });
  }

  logFileDelete(userId, username, fileName, ministryId, reason) {
    this.logFileEvent('DELETE', {
      userId,
      username,
      fileName,
      ministryId,
      reason,
      sensitivity: 'high'
    });
  }

  /**
   * Helper Methods
   */
  getCurrentSessionId() {
    // Implementation depends on session management
    return 'session_' + Date.now();
  }

  getCurrentRequestId() {
    // Get from request context
    return 'req_' + Date.now();
  }

  getUserAgent() {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
  }

  getClientIP() {
    // Get from request context
    return '127.0.0.1';
  }

  sanitizeValue(value) {
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...[TRUNCATED]';
    }
    return value;
  }

  sanitizeStackTrace(stack) {
    if (!stack) return 'No stack trace available';
    
    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .slice(0, 5)
      .join('\n');
  }

  /**
   * Query logs (for admin interface)
   */
  async queryLogs(filters = {}) {
    // In production, query from log storage system
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    let filteredLogs = logs;
    
    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }
    
    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(startDate, endDate, categories = []) {
    const logs = await this.queryLogs({
      startDate,
      endDate,
      categories
    });

    const report = {
      reportId: 'RPT_' + Date.now(),
      generatedAt: new Date().toISOString(),
      period: { startDate, endDate },
      totalEvents: logs.length,
      categories: this.summarizeByCategory(logs),
      users: this.summarizeByUser(logs),
      security: this.summarizeSecurityEvents(logs),
      errors: this.summarizeErrors(logs)
    };

    // Log report generation
    this.logSystemEvent('AUDIT_REPORT_GENERATED', {
      reportId: report.reportId,
      period: report.period,
      eventCount: report.totalEvents
    });

    return report;
  }

  summarizeByCategory(logs) {
    return logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {});
  }

  summarizeByUser(logs) {
    return logs.reduce((acc, log) => {
      if (log.userId) {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
      }
      return acc;
    }, {});
  }

  summarizeSecurityEvents(logs) {
    const securityLogs = logs.filter(log => log.category === 'security');
    return {
      total: securityLogs.length,
      threats: securityLogs.filter(log => log.event.includes('THREAT')).length,
      rateLimits: securityLogs.filter(log => log.event.includes('RATE_LIMIT')).length,
      suspicious: securityLogs.filter(log => log.event.includes('SUSPICIOUS')).length
    };
  }

  summarizeErrors(logs) {
    const errorLogs = logs.filter(log => log.level === 'error');
    return {
      total: errorLogs.length,
      byType: errorLogs.reduce((acc, log) => {
        acc[log.errorName || 'Unknown'] = (acc[log.errorName || 'Unknown'] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Health check
   */
  healthCheck() {
    return {
      status: 'healthy',
      bufferedEvents: this.eventBuffer.length,
      bufferSize: this.bufferSize,
      flushInterval: this.flushInterval,
      logLevel: this.logger.level,
      transports: this.logger.transports.length
    };
  }
}

// Export singleton instance
const auditLogger = new AuditLogger();
export default auditLogger;