// Browser-compatible logging for Sudan OID Portal
import CryptoJS from 'crypto-js';
import configManager from './ConfigManager.js';

/**
 * Comprehensive Audit Logging System
 * Tracks security events, user actions, and system activities
 * Browser-compatible version without Winston dependency
 */

class AuditLogger {
  constructor() {
    this.eventBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.startBufferFlush();
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
  }

  /**
   * Log security events
   */
  security(event, details = {}) {
    this.log('SECURITY', event, details);
  }

  /**
   * Log authentication events
   */
  auth(event, details = {}) {
    this.log('AUTH', event, details);
  }

  /**
   * Log data access events
   */
  dataAccess(event, details = {}) {
    this.log('DATA_ACCESS', event, details);
  }

  /**
   * Log system events
   */
  system(event, details = {}) {
    this.log('SYSTEM', event, details);
  }

  /**
   * Core logging method
   */
  log(category, event, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      event,
      details,
      sessionId: this.getSessionId(),
      userId: details.userId || 'anonymous',
      ip: 'browser-env',
      userAgent: navigator.userAgent,
      level: this.logLevel.toUpperCase()
    };

    // Add signature for integrity
    logEntry.signature = this.generateLogSignature(logEntry);

    // Add to buffer
    this.eventBuffer.push(logEntry);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${category}] ${event}:`, details);
    }

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Generate cryptographic signature for log integrity
   */
  generateLogSignature(logData) {
    try {
      const logString = JSON.stringify(logData);
      const secret = configManager.get('ENCRYPTION_KEY') || 'default-dev-secret';
      return CryptoJS.HmacSHA256(logString, secret).toString();
    } catch (error) {
      return 'signature_error';
    }
  }

  /**
   * Start buffer flush mechanism
   */
  startBufferFlush() {
    setInterval(() => {
      if (this.eventBuffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Flush buffer to storage/API
   */
  flush() {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    // In a real implementation, this would send to a logging API
    // For now, just store in localStorage for development
    try {
      const existingLogs = JSON.parse(localStorage.getItem('sudan-audit-logs') || '[]');
      const updatedLogs = [...existingLogs, ...events];

      // Keep only last 1000 entries in localStorage
      if (updatedLogs.length > 1000) {
        updatedLogs.splice(0, updatedLogs.length - 1000);
      }

      localStorage.setItem('sudan-audit-logs', JSON.stringify(updatedLogs));

      if (process.env.NODE_ENV === 'development') {
        console.log('Audit logs flushed:', events.length, 'entries');
      }
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
    }
  }

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('sudan-session-id');
    if (!sessionId) {
      sessionId = CryptoJS.lib.WordArray.random(16).toString();
      sessionStorage.setItem('sudan-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get audit logs (for admin dashboard)
   */
  getLogs(limit = 100) {
    try {
      const logs = JSON.parse(localStorage.getItem('sudan-audit-logs') || '[]');
      return logs.slice(-limit).reverse(); // Most recent first
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Clear all logs (admin only)
   */
  clearLogs() {
    try {
      localStorage.removeItem('sudan-audit-logs');
      this.eventBuffer = [];
      return true;
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
      return false;
    }
  }

  /**
   * Export logs for analysis
   */
  exportLogs() {
    try {
      const logs = this.getLogs(10000); // Export all
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `sudan-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      // Only remove if still attached (avoid NotFoundError in test environments)
      try {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      } catch (err) {
        // Ignore removal errors in test environments
      }

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return false;
    }
  }
}

// Singleton instance
const auditLogger = new AuditLogger();

export default auditLogger;
