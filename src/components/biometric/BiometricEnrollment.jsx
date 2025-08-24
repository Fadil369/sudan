import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Info as InfoIcon,
  PhotoCamera as CameraIcon,
  GraphicEq as AudioIcon,
  Cached as RefreshIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedIcon,
  Speed as QualityIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const BiometricEnrollment = ({ citizenData, onEnrollmentComplete, onCancel }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState({
    fingerprints: [],
    faceTemplates: [],
    irisTemplates: [],
    voiceTemplates: []
  });
  const [currentCapture, setCurrentCapture] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureStatus, setCaptureStatus] = useState('idle');
  const [qualityScores, setQualityScores] = useState({});
  const [consents, setConsents] = useState({
    biometricStorage: false,
    biometricProcessing: false,
    dataRetention: false,
    auditTrail: false
  });
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  // Media refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Enrollment steps configuration
  const enrollmentSteps = [
    {
      key: 'consent',
      label: isRTL ? 'الموافقات' : 'Consent',
      description: isRTL ? 'الموافقة على معالجة البيانات البيومترية' : 'Consent for biometric data processing',
      required: true
    },
    {
      key: 'fingerprints',
      label: isRTL ? 'تسجيل البصمات' : 'Fingerprint Registration',
      description: isRTL ? 'تسجيل بصمات الأصابع (مطلوب 2-10 بصمات)' : 'Register fingerprints (2-10 required)',
      minSamples: 2,
      maxSamples: 10,
      icon: <FingerprintIcon />
    },
    {
      key: 'facial',
      label: isRTL ? 'تسجيل الوجه' : 'Face Registration',
      description: isRTL ? 'تسجيل نماذج الوجه من زوايا مختلفة' : 'Register face templates from different angles',
      minSamples: 3,
      maxSamples: 5,
      icon: <FaceIcon />
    },
    {
      key: 'iris',
      label: isRTL ? 'تسجيل العين' : 'Iris Registration',
      description: isRTL ? 'تسجيل أنماط العين (اختياري)' : 'Register iris patterns (optional)',
      minSamples: 2,
      maxSamples: 4,
      optional: true,
      icon: <EyeIcon />
    },
    {
      key: 'voice',
      label: isRTL ? 'تسجيل الصوت' : 'Voice Registration',
      description: isRTL ? 'تسجيل عينات صوتية للتعرف (اختياري)' : 'Register voice samples for recognition (optional)',
      minSamples: 3,
      maxSamples: 5,
      optional: true,
      icon: <VoiceIcon />
    },
    {
      key: 'verification',
      label: isRTL ? 'التحقق' : 'Verification',
      description: isRTL ? 'التحقق من جودة التسجيل' : 'Verify enrollment quality',
      required: true
    }
  ];

  // Quality thresholds
  const qualityThresholds = {
    fingerprint: { minimum: 60, good: 80, excellent: 95 },
    facial: { minimum: 70, good: 85, excellent: 95 },
    iris: { minimum: 80, good: 90, excellent: 98 },
    voice: { minimum: 65, good: 80, excellent: 92 }
  };

  const voicePrompts = {
    ar: [
      'قل: أنا مواطن سوداني وأسجل هويتي الرقمية',
      'قل: اسمي هو [الاسم] ورقم هويتي [الرقم]',
      'قل: أؤكد موافقتي على تسجيل بياناتي البيومترية',
      'اقرأ الأرقام: واحد اثنان ثلاثة أربعة خمسة',
      'قل: هذا صوتي الحقيقي للتحقق من الهوية'
    ],
    en: [
      'Say: I am a Sudanese citizen registering my digital identity',
      'Say: My name is [Name] and my ID number is [Number]',
      'Say: I confirm my consent to register my biometric data',
      'Read the numbers: One two three four five',
      'Say: This is my authentic voice for identity verification'
    ]
  };

  useEffect(() => {
    return () => {
      // Cleanup media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const nextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const startCapture = async (biometricType, sampleIndex) => {
    setCurrentCapture({ type: biometricType, index: sampleIndex });
    setCaptureStatus('preparing');
    setCaptureProgress(0);

    try {
      switch (biometricType) {
        case 'fingerprints':
          await captureFingerprintSample(sampleIndex);
          break;
        case 'facial':
          await captureFacialSample(sampleIndex);
          break;
        case 'iris':
          await captureIrisSample(sampleIndex);
          break;
        case 'voice':
          await captureVoiceSample(sampleIndex);
          break;
      }
    } catch (error) {
      console.error(`Error capturing ${biometricType}:`, error);
      setCaptureStatus('error');
    }
  };

  const captureFingerprintSample = async (index) => {
    setCaptureStatus('capturing');
    
    // Simulate fingerprint capture
    const progressInterval = setInterval(() => {
      setCaptureProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock fingerprint data with quality score
    const qualityScore = Math.random() * 40 + 60; // 60-100
    const fingerprintData = {
      id: `fp_${index}_${Date.now()}`,
      finger: index % 10, // 0-9 for different fingers
      template: `fingerprint_template_${index}`, // Mock template data
      quality: Math.round(qualityScore),
      timestamp: new Date().toISOString()
    };

    setEnrollmentData(prev => ({
      ...prev,
      fingerprints: [...prev.fingerprints, fingerprintData]
    }));

    setQualityScores(prev => ({
      ...prev,
      [`fingerprint_${index}`]: qualityScore
    }));

    setCaptureStatus('success');
    setCurrentCapture(null);
  };

  const captureFacialSample = async (index) => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      setCaptureStatus('capturing');

      // Capture multiple angles
      const angles = ['front', 'left', 'right', 'up', 'down'];
      const currentAngle = angles[index % angles.length];

      // Simulate face detection and capture
      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 150);

      await new Promise(resolve => setTimeout(resolve, 4000));

      // Generate mock facial template
      const qualityScore = Math.random() * 30 + 70; // 70-100
      const faceTemplate = {
        id: `face_${index}_${Date.now()}`,
        angle: currentAngle,
        template: `face_template_${index}`,
        quality: Math.round(qualityScore),
        landmarks: 68, // Number of facial landmarks detected
        timestamp: new Date().toISOString()
      };

      setEnrollmentData(prev => ({
        ...prev,
        faceTemplates: [...prev.faceTemplates, faceTemplate]
      }));

      setQualityScores(prev => ({
        ...prev,
        [`facial_${index}`]: qualityScore
      }));

      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      setCaptureStatus('success');
      setCurrentCapture(null);

    } catch (error) {
      setCaptureStatus('error');
      throw error;
    }
  };

  const captureIrisSample = async (index) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        }
      });

      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCaptureStatus('capturing');

      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 3;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 6000));

      const qualityScore = Math.random() * 20 + 80; // 80-100 (higher for iris)
      const irisTemplate = {
        id: `iris_${index}_${Date.now()}`,
        eye: index % 2 === 0 ? 'left' : 'right',
        template: `iris_template_${index}`,
        quality: Math.round(qualityScore),
        timestamp: new Date().toISOString()
      };

      setEnrollmentData(prev => ({
        ...prev,
        irisTemplates: [...prev.irisTemplates, irisTemplate]
      }));

      setQualityScores(prev => ({
        ...prev,
        [`iris_${index}`]: qualityScore
      }));

      stream.getTracks().forEach(track => track.stop());
      setCaptureStatus('success');
      setCurrentCapture(null);

    } catch (error) {
      setCaptureStatus('error');
      throw error;
    }
  };

  const captureVoiceSample = async (index) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      setCaptureStatus('capturing');
      const audioChunks = [];
      
      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.start();

      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);

      // Record for 10 seconds
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());

        const qualityScore = Math.random() * 35 + 65; // 65-100
        const voiceTemplate = {
          id: `voice_${index}_${Date.now()}`,
          prompt: voicePrompts[isRTL ? 'ar' : 'en'][index % voicePrompts.ar.length],
          template: `voice_template_${index}`,
          quality: Math.round(qualityScore),
          duration: 10, // seconds
          timestamp: new Date().toISOString()
        };

        setEnrollmentData(prev => ({
          ...prev,
          voiceTemplates: [...prev.voiceTemplates, voiceTemplate]
        }));

        setQualityScores(prev => ({
          ...prev,
          [`voice_${index}`]: qualityScore
        }));

        setCaptureStatus('success');
        setCurrentCapture(null);
      }, 10000);

    } catch (error) {
      setCaptureStatus('error');
      throw error;
    }
  };

  const getQualityColor = (score, type) => {
    const thresholds = qualityThresholds[type] || qualityThresholds.fingerprint;
    if (score >= thresholds.excellent) return 'success';
    if (score >= thresholds.good) return 'primary';
    if (score >= thresholds.minimum) return 'warning';
    return 'error';
  };

  const getQualityLabel = (score, type) => {
    const thresholds = qualityThresholds[type] || qualityThresholds.fingerprint;
    if (score >= thresholds.excellent) return isRTL ? 'ممتاز' : 'Excellent';
    if (score >= thresholds.good) return isRTL ? 'جيد' : 'Good';
    if (score >= thresholds.minimum) return isRTL ? 'مقبول' : 'Acceptable';
    return isRTL ? 'ضعيف' : 'Poor';
  };

  const canProceedToNext = () => {
    const currentStepData = enrollmentSteps[activeStep];
    
    if (currentStepData.key === 'consent') {
      return Object.values(consents).every(consent => consent);
    }
    
    if (currentStepData.required && !currentStepData.optional) {
      const samples = enrollmentData[currentStepData.key] || [];
      return samples.length >= (currentStepData.minSamples || 1);
    }
    
    return true;
  };

  const handleEnrollmentComplete = async () => {
    try {
      // Calculate overall enrollment quality
      const allQualities = Object.values(qualityScores);
      const overallQuality = allQualities.reduce((sum, score) => sum + score, 0) / allQualities.length;

      const enrollmentResult = {
        citizenId: citizenData.oid,
        enrollmentData,
        qualityScores,
        overallQuality: Math.round(overallQuality),
        timestamp: new Date().toISOString(),
        consents,
        enrollmentId: `ENR_${citizenData.oid}_${Date.now()}`
      };

      // Call completion handler
      if (onEnrollmentComplete) {
        await onEnrollmentComplete(enrollmentResult);
      }

    } catch (error) {
      console.error('Error completing enrollment:', error);
    }
  };

  const renderConsentStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isRTL ? 'الموافقات المطلوبة' : 'Required Consents'}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          {isRTL ? 
            'يجب الموافقة على جميع البنود التالية لمتابعة تسجيل البيانات البيومترية' :
            'You must agree to all the following terms to proceed with biometric enrollment'
          }
        </Alert>

        <List>
          <ListItem>
            <ListItemIcon>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consents.biometricStorage}
                    onChange={(e) => setConsents(prev => ({
                      ...prev,
                      biometricStorage: e.target.checked
                    }))}
                  />
                }
                label=""
              />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 
                'الموافقة على تخزين البيانات البيومترية' :
                'Consent to biometric data storage'
              }
              secondary={isRTL ?
                'أوافق على تخزين بياناتي البيومترية بشكل آمن لأغراض التحقق من الهوية' :
                'I agree to the secure storage of my biometric data for identity verification purposes'
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemIcon>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consents.biometricProcessing}
                    onChange={(e) => setConsents(prev => ({
                      ...prev,
                      biometricProcessing: e.target.checked
                    }))}
                  />
                }
                label=""
              />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ?
                'الموافقة على معالجة البيانات البيومترية' :
                'Consent to biometric data processing'
              }
              secondary={isRTL ?
                'أوافق على معالجة بياناتي البيومترية للمقارنة والتحقق من الهوية' :
                'I agree to the processing of my biometric data for comparison and identity verification'
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemIcon>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consents.dataRetention}
                    onChange={(e) => setConsents(prev => ({
                      ...prev,
                      dataRetention: e.target.checked
                    }))}
                  />
                }
                label=""
              />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ?
                'سياسة الاحتفاظ بالبيانات' :
                'Data retention policy'
              }
              secondary={isRTL ?
                'أفهم أن بياناتي البيومترية ستُحفظ طوال فترة صلاحية الهوية الرقمية' :
                'I understand that my biometric data will be retained for the duration of my digital identity validity'
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemIcon>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consents.auditTrail}
                    onChange={(e) => setConsents(prev => ({
                      ...prev,
                      auditTrail: e.target.checked
                    }))}
                  />
                }
                label=""
              />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ?
                'سجل المراجعة والتدقيق' :
                'Audit trail logging'
              }
              secondary={isRTL ?
                'أوافق على تسجيل عمليات الوصول إلى بياناتي البيومترية لأغراض الأمان والتدقيق' :
                'I agree to the logging of access to my biometric data for security and audit purposes'
              }
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  const renderBiometricStep = (stepData) => {
    const samples = enrollmentData[stepData.key] || [];
    const requiredSamples = stepData.minSamples || 1;
    const maxSamples = stepData.maxSamples || requiredSamples;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {stepData.label}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {stepData.description}
          </Typography>

          {/* Sample Collection Interface */}
          {currentCapture?.type === stepData.key ? (
            <Paper sx={{ p: 3, textAlign: 'center', my: 2 }}>
              {stepData.key === 'facial' && (
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
              )}

              {stepData.key === 'iris' && (
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
              )}

              {stepData.key === 'fingerprints' && (
                <FingerprintIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
              )}

              {stepData.key === 'voice' && (
                <Box>
                  <VoiceIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    {isRTL ? 'اقرأ النص التالي:' : 'Read the following text:'}
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      {voicePrompts[isRTL ? 'ar' : 'en'][samples.length % voicePrompts.ar.length]}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <LinearProgress
                variant="determinate"
                value={captureProgress}
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2">
                {captureStatus === 'preparing' && (isRTL ? 'جاري التحضير...' : 'Preparing...')}
                {captureStatus === 'capturing' && (isRTL ? 'جاري التسجيل...' : 'Capturing...')}
                {captureStatus === 'success' && (isRTL ? 'تم التسجيل بنجاح!' : 'Captured successfully!')}
                {captureStatus === 'error' && (isRTL ? 'حدث خطأ' : 'Error occurred')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2} sx={{ my: 2 }}>
              {Array.from({ length: maxSamples }, (_, index) => {
                const sample = samples[index];
                const qualityKey = `${stepData.key.slice(0, -1)}_${index}`;
                const quality = qualityScores[qualityKey];
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: sample ? '2px solid' : '1px dashed',
                        borderColor: sample ? 
                          getQualityColor(quality, stepData.key.slice(0, -1)) + '.main' :
                          'grey.300'
                      }}
                    >
                      {sample ? (
                        <Box>
                          <SuccessIcon color="success" sx={{ mb: 1 }} />
                          <Typography variant="body2" gutterBottom>
                            {isRTL ? `العينة ${index + 1}` : `Sample ${index + 1}`}
                          </Typography>
                          <Chip
                            label={`${Math.round(quality)}% - ${getQualityLabel(quality, stepData.key.slice(0, -1))}`}
                            color={getQualityColor(quality, stepData.key.slice(0, -1))}
                            size="small"
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Button
                            variant="outlined"
                            onClick={() => startCapture(stepData.key, index)}
                            disabled={currentCapture !== null}
                            startIcon={stepData.icon}
                            sx={{ mb: 1 }}
                          >
                            {isRTL ? 'تسجيل' : 'Capture'}
                          </Button>
                          <Typography variant="body2" color="textSecondary">
                            {isRTL ? `العينة ${index + 1}` : `Sample ${index + 1}`}
                            {index < requiredSamples && (
                              <Chip label={isRTL ? 'مطلوب' : 'Required'} color="primary" size="small" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Progress Summary */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              {isRTL ? 'التقدم' : 'Progress'}: {samples.length} / {requiredSamples} 
              {stepData.optional && (isRTL ? ' (اختياري)' : ' (optional)')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(samples.length / requiredSamples) * 100}
              color={samples.length >= requiredSamples ? 'success' : 'primary'}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderVerificationStep = () => {
    const overallQuality = Object.values(qualityScores).reduce((sum, score) => sum + score, 0) / Object.values(qualityScores).length;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isRTL ? 'مراجعة التسجيل' : 'Enrollment Review'}
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            {isRTL ?
              `تم إكمال التسجيل بنجاح! جودة التسجيل الإجمالية: ${Math.round(overallQuality)}%` :
              `Enrollment completed successfully! Overall enrollment quality: ${Math.round(overallQuality)}%`
            }
          </Alert>

          <Accordion expanded={showQualityDetails} onChange={() => setShowQualityDetails(!showQualityDetails)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {isRTL ? 'تفاصيل الجودة' : 'Quality Details'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(qualityScores).map(([key, score]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Paper sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">{key}</Typography>
                        <Chip
                          icon={<QualityIcon />}
                          label={`${Math.round(score)}%`}
                          color={getQualityColor(score, key.split('_')[0])}
                          size="small"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleEnrollmentComplete}
              startIcon={<SaveIcon />}
            >
              {isRTL ? 'إكمال التسجيل' : 'Complete Enrollment'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderConsentStep();
      case enrollmentSteps.length - 1:
        return renderVerificationStep();
      default:
        return renderBiometricStep(enrollmentSteps[step]);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <VerifiedIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" component="h1">
            {isRTL ? 'تسجيل البيانات البيومترية' : 'Biometric Enrollment'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isRTL ? 'تسجيل بياناتك البيومترية للهوية الرقمية' : 'Register your biometric data for digital identity'}
          </Typography>
        </Box>
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {enrollmentSteps.map((step, index) => (
            <Step key={step.key}>
              <StepLabel>
                <Typography variant="body2">
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 3 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button
          onClick={activeStep === 0 ? onCancel : prevStep}
          variant="outlined"
        >
          {activeStep === 0 ? (isRTL ? 'إلغاء' : 'Cancel') : (isRTL ? 'السابق' : 'Previous')}
        </Button>

        {activeStep < enrollmentSteps.length - 1 && (
          <Button
            variant="contained"
            onClick={nextStep}
            disabled={!canProceedToNext()}
          >
            {isRTL ? 'التالي' : 'Next'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BiometricEnrollment;