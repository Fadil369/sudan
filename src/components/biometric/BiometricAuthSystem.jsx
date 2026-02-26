import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  CircularProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Face as FaceIcon,
  Visibility as EyeIcon,
  Mic as VoiceIcon,
  Security as SecurityIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  PhotoCamera as CameraIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  VolumeUp as SpeakerIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const BiometricAuthSystem = ({ citizenData, onAuthComplete, onAuthError }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [authMethods, setAuthMethods] = useState({
    fingerprint: { enabled: true, completed: false, confidence: 0, attempts: 0 },
    facial: { enabled: true, completed: false, confidence: 0, attempts: 0 },
    iris: { enabled: false, completed: false, confidence: 0, attempts: 0 },
    voice: { enabled: false, completed: false, confidence: 0, attempts: 0 }
  });
  const [currentAuth, setCurrentAuth] = useState(null);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStatus, setAuthStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [livenessCheck, setLivenessCheck] = useState(true);
  const [multiModalAuth, setMultiModalAuth] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  // Refs for media access
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const fingerprintScannerRef = useRef(null);

  // Biometric authentication steps
  const authSteps = [
    {
      key: 'fingerprint',
      label: isRTL ? 'مسح البصمة' : 'Fingerprint Scan',
      description: isRTL ? 'ضع إصبعك على الماسح' : 'Place your finger on the scanner',
      icon: <FingerprintIcon />,
      color: 'primary'
    },
    {
      key: 'facial',
      label: isRTL ? 'التعرف على الوجه' : 'Face Recognition',
      description: isRTL ? 'انظر إلى الكاميرا مباشرة' : 'Look directly at the camera',
      icon: <FaceIcon />,
      color: 'secondary'
    },
    {
      key: 'iris',
      label: isRTL ? 'مسح العين' : 'Iris Scan',
      description: isRTL ? 'حرك عينيك نحو الكاميرا' : 'Position your eyes toward the camera',
      icon: <EyeIcon />,
      color: 'info'
    },
    {
      key: 'voice',
      label: isRTL ? 'التعرف الصوتي' : 'Voice Recognition',
      description: isRTL ? 'تحدث بوضوح في الميكروفون' : 'Speak clearly into the microphone',
      icon: <VoiceIcon />,
      color: 'success'
    }
  ];

  // Voice phrases for verification
  const voicePhrases = {
    ar: [
      'أنا مواطن سوداني وأؤكد هويتي',
      'اسمي [اسم المواطن] ورقمي القومي [الرقم]',
      'أطلب الوصول إلى خدمات الحكومة الرقمية',
      'هذا صوتي الحقيقي للتحقق من الهوية'
    ],
    en: [
      'I am a Sudanese citizen confirming my identity',
      'My name is [citizen name] and my national ID is [number]',
      'I request access to digital government services',
      'This is my authentic voice for identity verification'
    ]
  };

  useEffect(() => {
    // Initialize biometric capabilities check
    checkBiometricCapabilities();
    
    return () => {
      // Cleanup media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      // Check WebAuthn support
      const webAuthnSupported = window.PublicKeyCredential !== undefined;
      
      // Check camera access
      const cameraSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      
      // Check microphone access
      const micSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      
      // Update auth methods based on capabilities
      setAuthMethods(prev => ({
        ...prev,
        fingerprint: { ...prev.fingerprint, enabled: webAuthnSupported },
        facial: { ...prev.facial, enabled: cameraSupported },
        iris: { ...prev.iris, enabled: cameraSupported },
        voice: { ...prev.voice, enabled: micSupported }
      }));
      
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const startAuthentication = async (method) => {
    setCurrentAuth(method);
    setAuthStatus('processing');
    setAuthProgress(0);
    setErrorMessage('');

    try {
      switch (method) {
        case 'fingerprint':
          await authenticateFingerprint();
          break;
        case 'facial':
          await authenticateFacial();
          break;
        case 'iris':
          await authenticateIris();
          break;
        case 'voice':
          await authenticateVoice();
          break;
        default:
          throw new Error('Unknown authentication method');
      }
    } catch (error) {
      handleAuthError(method, error);
    }
  };

  const authenticateFingerprint = async () => {
    try {
      // Simulate WebAuthn fingerprint authentication
      const progressInterval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 200);

      // Mock WebAuthn call
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Simulate successful fingerprint verification
      const confidence = Math.random() * 20 + 80; // 80-100% confidence
      
      if (confidence >= confidenceThreshold) {
        handleAuthSuccess('fingerprint', confidence);
      } else {
        throw new Error(`Low confidence: ${confidence.toFixed(1)}%`);
      }
      
    } catch (error) {
      throw new Error(isRTL ? 'فشل مسح البصمة' : 'Fingerprint scan failed');
    }
  };

  const authenticateFacial = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        } 
      });
      
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Start face detection
      await startFaceDetection();
      
    } catch (error) {
      throw new Error(isRTL ? 'فشل الوصول للكاميرا' : 'Camera access failed');
    }
  };

  const startFaceDetection = async () => {
    return new Promise((resolve, reject) => {
      const progressInterval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 3;
        });
      }, 150);

      // Simulate face detection and liveness check
      setTimeout(() => {
        const confidence = Math.random() * 25 + 75; // 75-100% confidence
        const livenessScore = Math.random() * 30 + 70; // 70-100% liveness
        
        if (confidence >= confidenceThreshold && (!livenessCheck || livenessScore >= 80)) {
          // Cleanup camera
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          handleAuthSuccess('facial', confidence);
          resolve();
        } else {
          reject(new Error(isRTL ? 
            'فشل التعرف على الوجه أو اختبار الحيوية' : 
            'Face recognition or liveness check failed'
          ));
        }
      }, 5000);
    });
  };

  const authenticateIris = async () => {
    try {
      // Similar to facial but with higher precision requirements
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user' 
        } 
      });
      
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Simulate iris detection
      const progressInterval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const confidence = Math.random() * 15 + 85; // 85-100% confidence (higher for iris)
      
      if (confidence >= confidenceThreshold) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        handleAuthSuccess('iris', confidence);
      } else {
        throw new Error(`Low iris recognition confidence: ${confidence.toFixed(1)}%`);
      }
      
    } catch (error) {
      throw new Error(isRTL ? 'فشل مسح العين' : 'Iris scan failed');
    }
  };

  const authenticateVoice = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Start voice recording
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const audioChunks = [];
      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      
      recorder.start();
      
      // Simulate voice processing
      const progressInterval = setInterval(() => {
        setAuthProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 4;
        });
      }, 300);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        
        const confidence = Math.random() * 20 + 80;
        if (confidence >= confidenceThreshold) {
          handleAuthSuccess('voice', confidence);
        } else {
          throw new Error(`Voice recognition confidence too low: ${confidence.toFixed(1)}%`);
        }
      }, 10000);
      
    } catch (error) {
      throw new Error(isRTL ? 'فشل التعرف الصوتي' : 'Voice recognition failed');
    }
  };

  const handleAuthSuccess = (method, confidence) => {
    setAuthMethods(prev => ({
      ...prev,
      [method]: { 
        ...prev[method], 
        completed: true, 
        confidence: Math.round(confidence),
        attempts: prev[method].attempts + 1
      }
    }));
    
    setAuthStatus('success');
    setCurrentAuth(null);
    
    // Check if multi-modal auth is required
    if (multiModalAuth) {
      const completedMethods = Object.values(authMethods).filter(m => m.completed).length + 1;
      if (completedMethods >= 2) {
        onAuthComplete({
          methods: authMethods,
          multiModal: true,
          overallConfidence: calculateOverallConfidence()
        });
      } else {
        // Move to next step
        setActiveStep(prev => prev + 1);
      }
    } else {
      onAuthComplete({
        method: method,
        confidence: confidence,
        multiModal: false
      });
    }
  };

  const handleAuthError = (method, error) => {
    setAuthMethods(prev => ({
      ...prev,
      [method]: { 
        ...prev[method], 
        attempts: prev[method].attempts + 1
      }
    }));
    
    setAuthStatus('error');
    setErrorMessage(error.message);
    setCurrentAuth(null);
    
    if (onAuthError) {
      onAuthError(error);
    }
  };

  const calculateOverallConfidence = () => {
    const completedMethods = Object.values(authMethods).filter(m => m.completed);
    const totalConfidence = completedMethods.reduce((sum, method) => sum + method.confidence, 0);
    return Math.round(totalConfidence / completedMethods.length);
  };

  const retryAuthentication = () => {
    setAuthStatus('idle');
    setErrorMessage('');
    setAuthProgress(0);
  };

  const renderBiometricStep = (step, index) => {
    const method = authMethods[step.key];
    const isActive = currentAuth === step.key;
    const isCompleted = method.completed;
    
    return (
      <Step key={step.key} active={isActive} completed={isCompleted}>
        <StepLabel 
          icon={
            <Avatar 
              sx={{ 
                bgcolor: isCompleted ? 'success.main' : isActive ? `${step.color}.main` : 'grey.300',
                color: 'white'
              }}
            >
              {isCompleted ? <SuccessIcon /> : step.icon}
            </Avatar>
          }
        >
          <Typography variant="h6">{step.label}</Typography>
          <Typography variant="body2" color="textSecondary">
            {step.description}
          </Typography>
          {isCompleted && (
            <Chip 
              label={`${method.confidence}% ${isRTL ? 'ثقة' : 'confidence'}`}
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </StepLabel>
        <StepContent>
          <Box sx={{ py: 2 }}>
            {renderAuthInterface(step.key)}
          </Box>
        </StepContent>
      </Step>
    );
  };

  const renderAuthInterface = (method) => {
    const isActive = currentAuth === method;
    const isProcessing = authStatus === 'processing' && currentAuth === method;
    
    return (
      <Card sx={{ p: 2, mb: 2 }}>
        <CardContent>
          {method === 'fingerprint' && (
            <Box textAlign="center">
              <FingerprintIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {isRTL ? 
                  'ضع إصبعك بثبات على الماسح البيومتري' :
                  'Place your finger firmly on the biometric scanner'
                }
              </Typography>
            </Box>
          )}
          
          {method === 'facial' && (
            <Box textAlign="center">
              <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 300,
                    borderRadius: 8,
                    objectFit: 'cover'
                  }}
                />
                {isProcessing && (
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    sx={{ transform: 'translate(-50%, -50%)' }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                )}
              </Paper>
              <Typography variant="body1">
                {isRTL ? 
                  'انظر مباشرة إلى الكاميرا وابق ثابتاً' :
                  'Look directly at the camera and stay still'
                }
              </Typography>
            </Box>
          )}
          
          {method === 'iris' && (
            <Box textAlign="center">
              <Paper sx={{ p: 2, mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 300,
                    borderRadius: 8,
                    objectFit: 'cover'
                  }}
                />
              </Paper>
              <Typography variant="body1">
                {isRTL ? 
                  'انظر مباشرة إلى الكاميرا بدون وميض' :
                  'Look directly at the camera without blinking'
                }
              </Typography>
            </Box>
          )}
          
          {method === 'voice' && (
            <Box textAlign="center">
              <VoiceIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {isRTL ? 'اقرأ العبارة التالية بوضوح:' : 'Read the following phrase clearly:'}
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="primary">
                  {voicePhrases[isRTL ? 'ar' : 'en'][0]}
                </Typography>
              </Paper>
              <audio ref={audioRef} controls style={{ display: 'none' }} />
            </Box>
          )}
          
          {isProcessing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={authProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary" textAlign="center">
                {isRTL ? 'جاري المعالجة...' : 'Processing...'} {authProgress}%
              </Typography>
            </Box>
          )}
          
          {authStatus === 'error' && errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {!isActive && !authMethods[method].completed && (
              <Button
                variant="contained"
                onClick={() => startAuthentication(method)}
                disabled={!authMethods[method].enabled}
                startIcon={authSteps.find(s => s.key === method)?.icon}
              >
                {isRTL ? 'ابدأ' : 'Start'}
              </Button>
            )}
            
            {authStatus === 'error' && (
              <Button
                variant="outlined"
                onClick={retryAuthentication}
                startIcon={<RefreshIcon />}
              >
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            )}
            
            {isActive && authStatus === 'processing' && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach(track => track.stop());
                  }
                  setCurrentAuth(null);
                  setAuthStatus('idle');
                }}
                startIcon={<StopIcon />}
              >
                {isRTL ? 'إيقاف' : 'Stop'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderSettings = () => (
    <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isRTL ? 'إعدادات المصادقة البيومترية' : 'Biometric Authentication Settings'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={livenessCheck}
                  onChange={(e) => setLivenessCheck(e.target.checked)}
                />
              }
              label={isRTL ? 'اختبار الحيوية (مضاد للتزوير)' : 'Liveness Detection (Anti-spoofing)'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={multiModalAuth}
                  onChange={(e) => setMultiModalAuth(e.target.checked)}
                />
              }
              label={isRTL ? 'المصادقة متعددة الطرق' : 'Multi-modal Authentication'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography gutterBottom>
              {isRTL ? 'حد الثقة المطلوب' : 'Confidence Threshold'}: {confidenceThreshold}%
            </Typography>
            <Slider
              value={confidenceThreshold}
              onChange={(e, value) => setConfidenceThreshold(value)}
              min={60}
              max={95}
              step={5}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>
          {isRTL ? 'حفظ' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
          <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              {isRTL ? 'نظام المصادقة البيومترية' : 'Biometric Authentication System'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {isRTL ? 'تأكيد الهوية بتقنيات متقدمة' : 'Advanced Identity Verification'}
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title={isRTL ? 'الإعدادات' : 'Settings'}>
          <IconButton onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Authentication Steps */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {authSteps.map((step, index) => renderBiometricStep(step, index))}
        </Stepper>
      </Paper>

      {/* Status Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isRTL ? 'ملخص الحالة' : 'Status Summary'}
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(authMethods).map(([key, method]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    {authSteps.find(s => s.key === key)?.icon}
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      {authSteps.find(s => s.key === key)?.label}
                    </Typography>
                  </Box>
                  
                  {method.completed ? (
                    <Chip 
                      icon={<VerifiedIcon />}
                      label={`${isRTL ? 'مكتمل' : 'Completed'} (${method.confidence}%)`}
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip 
                      label={method.enabled ? 
                        (isRTL ? 'متاح' : 'Available') : 
                        (isRTL ? 'غير متاح' : 'Unavailable')
                      }
                      color={method.enabled ? 'default' : 'error'}
                      size="small"
                    />
                  )}
                  
                  {method.attempts > 0 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {isRTL ? 'المحاولات' : 'Attempts'}: {method.attempts}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      {renderSettings()}
    </Box>
  );
};

export default BiometricAuthSystem;