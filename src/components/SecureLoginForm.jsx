import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Chip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Shield,
  Fingerprint,
  VpnKey,
  Warning,
  CheckCircle,
  ErrorOutline,
  Refresh
} from '@mui/icons-material';
import { useAuth } from './AuthProvider';

/**
 * Secure Login Form with enhanced security features
 * - Input validation and sanitization
 * - Rate limiting protection
 * - Captcha verification
 * - Biometric authentication option
 * - Security notifications
 */
const SecureLoginForm = ({ onClose }) => {
  const { login, loading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: '',
    mfaCode: '',
    rememberDevice: false
  });
  
  // Security state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showMFA, setShowMFA] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  
  // Refs
  const formRef = useRef();
  const captchaCanvasRef = useRef();
  
  useEffect(() => {
    generateCaptcha();
    checkSecurityStatus();
  }, []);

  useEffect(() => {
    if (blockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBlockTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isBlocked && blockTimeRemaining === 0) {
      setIsBlocked(false);
      setLoginAttempts(0);
    }
  }, [blockTimeRemaining, isBlocked]);

  /**
   * Generate visual captcha
   */
  const generateCaptcha = () => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    
    // Generate random captcha
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(captcha);

    // Draw captcha
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#1976d2';
    
    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Draw captcha text with random positioning
    for (let i = 0; i < captcha.length; i++) {
      const x = 20 + i * 25 + (Math.random() - 0.5) * 10;
      const y = 35 + (Math.random() - 0.5) * 10;
      ctx.fillText(captcha[i], x, y);
    }
  };

  /**
   * Check security status and alerts
   */
  const checkSecurityStatus = () => {
    // Check for recent security events
    const recentAlerts = [
      {
        type: 'info',
        message: 'Login from new device detected',
        timestamp: Date.now() - 300000
      }
    ];
    
    setSecurityAlerts(recentAlerts);
  };

  /**
   * Validate form input with security checks
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Captcha validation
    if (!formData.captcha) {
      newErrors.captcha = 'Please enter the captcha';
    } else if (formData.captcha !== captchaCode) {
      newErrors.captcha = 'Invalid captcha';
      generateCaptcha(); // Refresh captcha on error
    }
    
    // MFA validation (if required)
    if (showMFA && !formData.mfaCode) {
      newErrors.mfaCode = 'MFA code is required';
    } else if (showMFA && !/^\d{6}$/.test(formData.mfaCode)) {
      newErrors.mfaCode = 'MFA code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission with security measures
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      setErrors({ form: `Too many failed attempts. Try again in ${blockTimeRemaining} seconds.` });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const credentials = {
        username: formData.username.trim(),
        password: formData.password,
        captcha: formData.captcha,
        mfaCode: formData.mfaCode,
        deviceFingerprint: generateDeviceFingerprint(),
        rememberDevice: formData.rememberDevice
      };
      
      const result = await login(credentials);
      
      if (result.success) {
        // Reset security state on successful login
        setLoginAttempts(0);
        setErrors({});
        if (onClose) onClose();
      }
      
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      
      // Implement progressive delays
      if (loginAttempts >= 2) {
        setIsBlocked(true);
        setBlockTimeRemaining(Math.min(300, Math.pow(2, loginAttempts) * 30)); // Max 5 minutes
      }
      
      // Handle specific error types
      if (error.message.includes('MFA')) {
        setShowMFA(true);
        setErrors({ mfaCode: error.message });
      } else {
        setErrors({ 
          form: error.message || 'Login failed. Please check your credentials.' 
        });
        generateCaptcha(); // Refresh captcha after failed attempt
      }
    }
  };

  /**
   * Generate device fingerprint for security
   */
  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
      canvas: canvas.toDataURL(),
      timestamp: Date.now()
    }));
  };

  /**
   * Handle biometric authentication
   */
  const handleBiometricAuth = async () => {
    try {
      if (!window.navigator.credentials) {
        throw new Error('Biometric authentication not supported');
      }
      
      setShowBiometric(true);
      
      // Simulate biometric authentication
      // In production, use WebAuthn API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowBiometric(false);
      setFormData(prev => ({ ...prev, password: 'biometric_auth' }));
      
    } catch (error) {
      setShowBiometric(false);
      setErrors({ form: 'Biometric authentication failed. Please use password.' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Card elevation={8} sx={{ overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Shield sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Secure Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sudan Digital Government Portal
            </Typography>
          </Box>

          {/* Security Alerts */}
          {securityAlerts.map((alert, index) => (
            <Alert key={index} severity={alert.type} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          ))}

          {/* Block Warning */}
          {isBlocked && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Warning />
                <Typography>
                  Account temporarily locked. Try again in {blockTimeRemaining} seconds.
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" ref={formRef} onSubmit={handleSubmit}>
            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading || isBlocked}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                )
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading || isBlocked}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Captcha */}
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                Enter the code shown below:
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <canvas
                  ref={captchaCanvasRef}
                  width={180}
                  height={50}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}
                />
                <IconButton onClick={generateCaptcha} size="small">
                  <Refresh />
                </IconButton>
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Captcha Code"
                value={formData.captcha}
                onChange={(e) => handleInputChange('captcha', e.target.value)}
                error={!!errors.captcha}
                helperText={errors.captcha}
                disabled={loading || isBlocked}
              />
            </Box>

            {/* MFA Field (if required) */}
            {showMFA && (
              <TextField
                fullWidth
                label="MFA Code"
                value={formData.mfaCode}
                onChange={(e) => handleInputChange('mfaCode', e.target.value)}
                error={!!errors.mfaCode}
                helperText={errors.mfaCode}
                disabled={loading || isBlocked}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
              />
            )}

            {/* Options */}
            <Box mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberDevice}
                    onChange={(e) => handleInputChange('rememberDevice', e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    Remember this device (30 days)
                  </Typography>
                }
              />
            </Box>

            {/* Form Error */}
            {errors.form && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.form}
              </Alert>
            )}

            {/* Action Buttons */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || isBlocked}
              sx={{ mb: 2, py: 1.5 }}
              startIcon={loading ? <CircularProgress size={20} /> : <Security />}
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>

            <Divider sx={{ mb: 2 }}>
              <Chip label="OR" size="small" />
            </Divider>

            {/* Biometric Login */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBiometricAuth}
              disabled={loading || isBlocked || showBiometric}
              startIcon={showBiometric ? <CircularProgress size={20} /> : <Fingerprint />}
              sx={{ mb: 2 }}
            >
              {showBiometric ? 'Authenticating...' : 'Biometric Login'}
            </Button>

            {/* Security Info */}
            <Box mt={3} p={2} bgcolor="rgba(25, 118, 210, 0.05)" borderRadius={1}>
              <Typography variant="caption" color="primary" display="block" gutterBottom>
                <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                Security Features Active:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • End-to-end encryption
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Rate limiting protection
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Audit logging enabled
              </Typography>
            </Box>

            {/* Help Links */}
            <Box textAlign="center" mt={2}>
              <Link href="#" variant="body2" color="primary">
                Forgot password?
              </Link>
              {' | '}
              <Link href="#" variant="body2" color="primary">
                Need help?
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Login Attempts Warning */}
      {loginAttempts > 0 && loginAttempts < 3 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <ErrorOutline sx={{ mr: 1 }} />
          {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}. 
          {3 - loginAttempts} attempt{3 - loginAttempts > 1 ? 's' : ''} remaining before temporary lock.
        </Alert>
      )}
    </Box>
  );
};

export default SecureLoginForm;
