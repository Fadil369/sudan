import React from 'react';
import { Alert, Box, Button, Typography, Container, Paper } from '@mui/material';
import { Refresh, Home, ReportProblem } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      eventId: eventId
    });

    // Log error to audit system (in production, send to logging service)
    if (process.env.NODE_ENV === 'production') {
      this.logError(error, errorInfo, eventId);
    } else {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  logError = (error, errorInfo, eventId) => {
    // In production, this would send to your logging service
    const errorData = {
      eventId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous'
    };

    // Example: Send to logging service
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   body: JSON.stringify(errorData)
    // });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { language = 'en', showDetails = false } = this.props;
    const isRTL = language === 'ar';

    if (this.state.hasError) {
      const messages = {
        en: {
          title: 'Something went wrong',
          description: 'We apologize for the inconvenience. An unexpected error occurred in the Sudan Government Portal.',
          errorId: 'Error ID',
          reload: 'Reload Page',
          home: 'Go to Homepage',
          report: 'Report Issue',
          details: 'Technical Details',
          contact: 'If this problem persists, please contact our support team.',
          security: 'Your data and session remain secure.'
        },
        ar: {
          title: 'حدث خطأ غير متوقع',
          description: 'نعتذر عن الإزعاج. حدث خطأ غير متوقع في بوابة الحكومة السودانية.',
          errorId: 'رقم الخطأ',
          reload: 'إعادة تحميل الصفحة',
          home: 'الذهاب للصفحة الرئيسية',
          report: 'الإبلاغ عن المشكلة',
          details: 'التفاصيل التقنية',
          contact: 'إذا استمرت هذه المشكلة، يرجى الاتصال بفريق الدعم الفني.',
          security: 'بياناتك وجلستك آمنة.'
        }
      };

      const msg = messages[language];

      return (
        <Container maxWidth="md" sx={{ mt: 4, direction: isRTL ? 'rtl' : 'ltr' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <ReportProblem 
                sx={{ 
                  fontSize: 64, 
                  color: 'error.main',
                  mb: 2
                }} 
              />
            </Box>

            <Alert severity="error" sx={{ mb: 3, textAlign: isRTL ? 'right' : 'left' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {msg.title}
              </Typography>
              <Typography variant="body2">
                {msg.description}
              </Typography>
            </Alert>

            {this.state.eventId && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                {msg.errorId}: {this.state.eventId}
              </Typography>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                ✓ {msg.security}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {msg.contact}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              mb: 2
            }}>
              <Button 
                variant="contained" 
                startIcon={<Refresh />}
                onClick={this.handleReload}
                sx={{ 
                  bgcolor: '#ce1126',
                  '&:hover': { bgcolor: '#a00e1f' }
                }}
              >
                {msg.reload}
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Home />}
                onClick={this.handleGoHome}
                sx={{ 
                  borderColor: '#ce1126',
                  color: '#ce1126',
                  '&:hover': { borderColor: '#a00e1f', bgcolor: 'rgba(206, 17, 38, 0.04)' }
                }}
              >
                {msg.home}
              </Button>
            </Box>

            {showDetails && this.state.error && process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {msg.details}
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="body2" component="pre">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;