import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  BugReport,
  ExpandMore,
  Security,
  Home
} from '@mui/icons-material';

/**
 * Secure Error Boundary Component
 * Catches JavaScript errors, prevents information disclosure, and provides recovery options
 */
class SecureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: 'ERR_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error securely (without exposing sensitive information)
    this.logErrorSecurely(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  /**
   * Securely log error without exposing sensitive information
   */
  logErrorSecurely = (error, errorInfo) => {
    const secureErrorLog = {
      errorId: this.state.errorId || 'ERR_' + Date.now(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.user?.id || 'anonymous',
      userRole: this.props.user?.role || 'unknown',
      errorType: error.name,
      errorMessage: this.sanitizeErrorMessage(error.message),
      componentStack: this.sanitizeStackTrace(errorInfo.componentStack),
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('[ERROR BOUNDARY] Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Secure Log:', secureErrorLog);
      console.groupEnd();
    }

    // Send to logging service (implement in production)
    this.sendToLoggingService(secureErrorLog);

    // Store locally for offline support
    this.storeErrorLocally(secureErrorLog);
  };

  /**
   * Sanitize error message to prevent information disclosure
   */
  sanitizeErrorMessage = (message) => {
    if (!message || typeof message !== 'string') return 'Unknown error';
    
    // Remove potentially sensitive information
    const sanitized = message
      .replace(new RegExp('[A-Za-z]:[\\\\//].*?[\\\\]', 'g'), '[PATH_REDACTED]') // File paths
      .replace(new RegExp('https?://[^\\s]+', 'g'), '[URL_REDACTED]') // URLs
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]') // IP addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]') // Email addresses
      .replace(/\b\d{10,}\b/g, '[NUMBER_REDACTED]'); // Long numbers (potential IDs)
    
    return sanitized.substring(0, 500); // Limit message length
  };

  /**
   * Sanitize stack trace to remove sensitive paths
   */
  sanitizeStackTrace = (stackTrace) => {
    if (!stackTrace || typeof stackTrace !== 'string') return 'Stack trace not available';
    
    return stackTrace
      .split('\n')
      .map(line => line.replace(new RegExp('[A-Za-z]:[\\\\//].*?[\\\\]', 'g'), '[PATH_REDACTED]'))
      .filter(line => !line.includes('node_modules')) // Remove node_modules references
      .slice(0, 10) // Limit stack trace depth
      .join('\n');
  };

  /**
   * Send error to logging service
   */
  sendToLoggingService = async (errorLog) => {
    try {
      // In production, send to your logging service
      // await fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog)
      // });
      
      console.log('[ERROR BOUNDARY] Error logged:', errorLog.errorId);
    } catch (loggingError) {
      console.error('[ERROR BOUNDARY] Failed to log error:', loggingError);
    }
  };

  /**
   * Store error locally for offline support
   */
  storeErrorLocally = (errorLog) => {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors to prevent storage overflow
      const limitedLogs = existingLogs.slice(-50);
      
      localStorage.setItem('error_logs', JSON.stringify(limitedLogs));
    } catch (storageError) {
      console.error('[ERROR BOUNDARY] Failed to store error locally:', storageError);
    }
  };

  /**
   * Handle retry attempt
   */
  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    // Limit retry attempts
    if (newRetryCount > 3) {
      this.handleReload();
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: newRetryCount,
      showDetails: false
    });

    // Log retry attempt
    console.log('[ERROR BOUNDARY] Retry attempt:', newRetryCount);
  };

  /**
   * Handle page reload
   */
  handleReload = () => {
    // Clear error state before reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false
    });

    window.location.reload();
  };

  /**
   * Handle navigation to home
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Generate user-friendly error message
   */
  getUserFriendlyMessage = () => {
    const { error } = this.state;
    
    if (!error) return 'An unexpected error occurred';
    
    const errorMappings = {
      'ChunkLoadError': 'Failed to load application resources. Please refresh the page.',
      'TypeError': 'A data processing error occurred. Please try again.',
      'ReferenceError': 'A system component is not available. Please refresh the page.',
      'NetworkError': 'Network connection issue. Please check your internet connection.',
      'SecurityError': 'A security restriction was encountered. Please contact support.'
    };
    
    return errorMappings[error.name] || 'An unexpected error occurred. Please try again or contact support.';
  };

  /**
   * Get error severity level
   */
  getErrorSeverity = () => {
    const { error } = this.state;
    
    if (!error) return 'medium';
    
    const highSeverityErrors = ['SecurityError', 'ChunkLoadError'];
    const lowSeverityErrors = ['ValidationError', 'UserInputError'];
    
    if (highSeverityErrors.includes(error.name)) return 'high';
    if (lowSeverityErrors.includes(error.name)) return 'low';
    
    return 'medium';
  };

  render() {
    const { hasError, errorId, retryCount, showDetails, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      const severity = this.getErrorSeverity();
      const userMessage = this.getUserFriendlyMessage();
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Card
            elevation={8}
            sx={{
              maxWidth: 600,
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Error Header */}
              <Box display="flex" alignItems="center" mb={3}>
                <ErrorOutline 
                  sx={{ 
                    fontSize: 48, 
                    color: severity === 'high' ? '#dc2626' : severity === 'medium' ? '#f59e0b' : '#6366f1',
                    mr: 2 
                  }} 
                />
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    System Error
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip 
                      label={`ID: ${errorId}`} 
                      size="small" 
                      sx={{ fontFamily: 'monospace' }}
                    />
                    <Chip 
                      label={severity.toUpperCase()} 
                      size="small" 
                      color={severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info'}
                    />
                  </Box>
                </Box>
              </Box>

              {/* User-friendly Message */}
              <Alert 
                severity={severity === 'high' ? 'error' : 'warning'} 
                sx={{ mb: 3 }}
                icon={<Security />}
              >
                <Typography variant="body1">
                  {userMessage}
                </Typography>
              </Alert>

              {/* Action Buttons */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? 'Max Retries Reached' : `Retry ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                >
                  Go to Homepage
                </Button>
                
                <Button
                  variant="text"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </Box>

              {/* Error Details (Development Only) */}
              {isDevelopment && error && (
                <Accordion expanded={showDetails} onChange={() => this.setState({ showDetails: !showDetails })}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BugReport />
                      Developer Details
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Error Type:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ fontFamily: 'monospace', mb: 2, p: 1, bgcolor: '#f5f5f5' }}
                      >
                        {error.name}: {error.message}
                      </Typography>
                      
                      {errorInfo && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Component Stack:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              whiteSpace: 'pre-wrap', 
                              p: 1, 
                              bgcolor: '#f5f5f5',
                              fontSize: '0.8rem',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            {this.sanitizeStackTrace(errorInfo.componentStack)}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Support Information */}
              <Box mt={3} p={2} bgcolor="rgba(59, 130, 246, 0.1)" borderRadius={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Need Help?</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If this problem persists, please contact technical support with error ID: <strong>{errorId}</strong>
                </Typography>
              </Box>

              {/* Security Notice */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Your session and data remain secure. This error has been automatically logged for analysis.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return children;
  }
}

export default SecureErrorBoundary;