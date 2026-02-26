/* eslint-disable no-unused-vars */
import {
    AccountTree,
    Badge as BadgeIcon,
    Check,
    ContactPhone,
    DateRange,
    Email,
    Error,
    FaceRetouchingNatural,
    Fingerprint,
    LocationOn,
    Person,
    Psychology,
    RemoveRedEye,
    Search,
    Security,
    Shield
} from '@mui/icons-material';

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';

import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { createCitizenOid } from '../config/oidConfig';

const OIDIntegration = ({ isRTL = false, language = 'en', selectedDepartment, userRole = 'citizen' }) => {
  // Accessibility settings
  const { accessibility } = useAccessibility();
  // Determine right-to-left from accessibility context
  const rtl = accessibility.rightToLeft;
  const [citizenData, setCitizenData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('none'); // none, scanning, processing, verified, failed
  // Apply accessibility font size and contrast
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', accessibility.fontSize === 'small' ? '0.875' : accessibility.fontSize === 'large' ? '1.25' : accessibility.fontSize === 'xlarge' ? '1.5' : '1');
    if (accessibility.highContrast) root.classList.add('high-contrast'); else root.classList.remove('high-contrast');
  }, [accessibility.fontSize, accessibility.highContrast]);
  const [_biometricData, _setBiometricData] = useState({
    fingerprint: null,
    face: null,
    iris: null,
    voice: null
  });
  const [oidNumber, setOidNumber] = useState(() =>
    createCitizenOid({
      stateCode: '01',
      localityCode: '001',
      entityId: '123456789',
      checkDigit: '7',
    })
  );
  const [qrCodeData, setQrCodeData] = useState('');
  const [_activeStep, _setActiveStep] = useState(0);
  const [_registrationDialog, _setRegistrationDialog] = useState(false);
  const [_verificationDialog, _setVerificationDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const _videoRef = useRef(null);
  const _canvasRef = useRef(null);

  // Mock citizen data based on OID
  useEffect(() => {
    if (oidNumber) {
      // Simulate API call to fetch citizen data
      const mockCitizenData = {
        oid: oidNumber,
        humanReadableId: 'SD-01-001-123456789',
        personalInfo: {
          firstNameArabic: 'محمد أحمد',
          lastNameArabic: 'الطيب',
          firstNameEnglish: 'Mohammed Ahmed',
          lastNameEnglish: 'Al-Tayeb',
          dateOfBirth: '1985-03-15',
          placeOfBirth: 'Khartoum, Sudan',
          gender: 'Male',
          nationality: 'Sudanese'
        },
        contactInfo: {
          phoneNumber: '+249123456789',
          email: 'mohammed.ahmed@example.sd',
          address: 'Block 5, Street 15, Khartoum 2, Sudan',
          emergencyContact: '+249987654321'
        },
        biometricStatus: {
          fingerprint: 'verified',
          face: 'verified',
          iris: 'pending',
          voice: 'not_enrolled'
        },
        certificates: {
          birth: { status: 'issued', date: '2024-01-15' },
          national_id: { status: 'issued', date: '2024-02-01' },
          passport: { status: 'pending', date: null },
          marriage: { status: 'not_applicable', date: null }
        },
        serviceConnections: [
          { id: 'health', name: 'Health Ministry', status: 'connected', permissions: ['medical_records', 'vaccination'] },
          { id: 'education', name: 'Education Ministry', status: 'connected', permissions: ['certificates'] },
          { id: 'finance', name: 'Finance Ministry', status: 'pending', permissions: ['tax_records'] }
        ],
        lastUpdated: '2024-01-20T10:30:00Z',
        registrationCenter: 'Khartoum Registration Center',
        verificationLevel: 'Level 3 (Biometric)',
        status: 'active'
      };

      setCitizenData(mockCitizenData);

      // Generate QR Code data
      setQrCodeData(JSON.stringify({
        oid: oidNumber,
        name: `${mockCitizenData.personalInfo.firstNameEnglish} ${mockCitizenData.personalInfo.lastNameEnglish}`,
        verification_level: mockCitizenData.verificationLevel,
        timestamp: Date.now()
      }));
    }
  }, [oidNumber]);

  const handleBiometricScan = async (type) => {
    setVerificationStatus('scanning');

    // Simulate biometric scanning
    setTimeout(() => {
      setVerificationStatus('processing');

      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          _setBiometricData(prev => ({
            ...prev,
            [type]: {
              captured: true,
              quality: 85 + Math.random() * 15,
              timestamp: Date.now()
            }
          }));
          setVerificationStatus('verified');
        } else {
          setVerificationStatus('failed');
        }
      }, 2000);
    }, 1500);
  };

  const getBiometricStatusColor = (status) => {
    switch (status) {
      case 'verified': return '#00e676';
      case 'pending': return '#f59e0b';
      case 'not_enrolled': return '#9e9e9e';
      default: return '#ef4444';
    }
  };

  const getBiometricStatusText = (status) => {
    switch (status) {
      case 'verified': return isRTL ? 'مُتحقق' : 'Verified';
      case 'pending': return isRTL ? 'في الانتظار' : 'Pending';
      case 'not_enrolled': return isRTL ? 'غير مسجل' : 'Not Enrolled';
      default: return isRTL ? 'فشل' : 'Failed';
    }
  };

  const renderCitizenProfile = () => (
    <Card className="oid-citizen-card">
      <CardContent sx={{ p: 3 }}>
        {/* Header with Avatar and Basic Info */}
        <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              fontSize: '2.5rem'
            }}
          >
            <Person sx={{ fontSize: '3rem' }} />
          </Avatar>

          <Box flex={1}>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              {isRTL
                ? `${citizenData.personalInfo.firstNameArabic} ${citizenData.personalInfo.lastNameArabic}`
                : `${citizenData.personalInfo.firstNameEnglish} ${citizenData.personalInfo.lastNameEnglish}`
              }
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                mb: 1
              }}
            >
              {citizenData.humanReadableId}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'monospace',
                fontSize: '0.75rem'
              }}
            >
              OID: {citizenData.oid}
            </Typography>

            <Box display="flex" gap={1} mt={2}>
              <Chip
                label={citizenData.verificationLevel}
                size="small"
                icon={<Shield />}
                sx={{
                  backgroundColor: 'rgba(0, 230, 118, 0.2)',
                  color: '#00e676',
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={citizenData.status}
                size="small"
                sx={{
                  backgroundColor: 'rgba(14, 165, 233, 0.2)',
                  color: '#0ea5e9',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          {/* QR Code */}
          <Box textAlign="center">
            <Paper
              sx={{
                p: 1,
                backgroundColor: 'white',
                borderRadius: 2
              }}
            >
              <QRCodeCanvas
                value={qrCodeData}
                size={80}
                level="H"
                includeMargin={true}
              />
            </Paper>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'block',
                mt: 1
              }}
            >
              {isRTL ? 'رمز الاستجابة السريعة' : 'QR Code'}
            </Typography>
          </Box>
        </Box>

        {/* Personal Information Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#0ea5e9'
                }
              }
            }}
          >
            <Tab label={isRTL ? 'المعلومات الشخصية' : 'Personal Info'} />
            <Tab label={isRTL ? 'القياسات الحيوية' : 'Biometrics'} />
            <Tab label={isRTL ? 'الشهادات' : 'Certificates'} />
            <Tab label={isRTL ? 'الخدمات المتصلة' : 'Connected Services'} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {selectedTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <DateRange sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                    secondary={citizenData.personalInfo.dateOfBirth}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'مكان الميلاد' : 'Place of Birth'}
                    secondary={citizenData.personalInfo.placeOfBirth}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <BadgeIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'الجنسية' : 'Nationality'}
                    secondary={citizenData.personalInfo.nationality}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <ContactPhone sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    secondary={citizenData.contactInfo.phoneNumber}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Email sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                    secondary={citizenData.contactInfo.email}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'العنوان' : 'Address'}
                    secondary={citizenData.contactInfo.address}
                    sx={{
                      '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
                      '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={2}>
            {Object.entries(citizenData.biometricStatus).map(([type, status]) => (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${getBiometricStatusColor(status)}15 0%, ${getBiometricStatusColor(status)}05 100%)`,
                    border: `1px solid ${getBiometricStatusColor(status)}30`
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    {type === 'fingerprint' && <Fingerprint sx={{ fontSize: 40, color: getBiometricStatusColor(status), mb: 1 }} />}
                    {type === 'face' && <FaceRetouchingNatural sx={{ fontSize: 40, color: getBiometricStatusColor(status), mb: 1 }} />}
                    {type === 'iris' && <RemoveRedEye sx={{ fontSize: 40, color: getBiometricStatusColor(status), mb: 1 }} />}
                    {type === 'voice' && <Psychology sx={{ fontSize: 40, color: getBiometricStatusColor(status), mb: 1 }} />}

                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, mb: 1 }}
                    >
                      {rtl
                        ? type === 'fingerprint' ? 'بصمة الإصبع'
                          : type === 'face' ? 'التعرف على الوجه'
                          : type === 'iris' ? 'بصمة العين'
                          : 'التعرف على الصوت'
                        : type === 'fingerprint' ? 'Fingerprint Scan'
                          : type === 'face' ? 'Facial Recognition'
                          : type === 'iris' ? 'Iris Scan'
                          : 'Voice Recognition'
                      }
                    </Typography>

                    <Chip
                      label={getBiometricStatusText(status)}
                      size="small"
                      sx={{
                        backgroundColor: `${getBiometricStatusColor(status)}20`,
                        color: getBiometricStatusColor(status),
                        fontSize: '0.7rem'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {selectedTab === 2 && (
          <Grid container spacing={2}>
            {Object.entries(citizenData.certificates).map(([certType, cert]) => (
              <Grid item xs={12} sm={6} key={certType}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography
                        variant="body1"
                        sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}
                      >
                        {isRTL
                          ? certType === 'birth' ? 'شهادة الميلاد'
                            : certType === 'national_id' ? 'البطاقة الشخصية'
                            : certType === 'passport' ? 'جواز السفر'
                            : 'شهادة الزواج'
                          : certType === 'birth' ? 'Birth Certificate'
                            : certType === 'national_id' ? 'National ID'
                            : certType === 'passport' ? 'Passport'
                            : 'Marriage Certificate'
                        }
                      </Typography>

                      <Chip
                        label={cert.status}
                        size="small"
                        sx={{
                          backgroundColor: cert.status === 'issued' ? 'rgba(0, 230, 118, 0.2)'
                                         : cert.status === 'pending' ? 'rgba(245, 158, 11, 0.2)'
                                         : 'rgba(158, 158, 158, 0.2)',
                          color: cert.status === 'issued' ? '#00e676'
                               : cert.status === 'pending' ? '#f59e0b'
                               : '#9e9e9e',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    {cert.date && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        {isRTL ? 'تاريخ الإصدار:' : 'Issued:'} {cert.date}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {selectedTab === 3 && (
          <Grid container spacing={2}>
            {citizenData.serviceConnections.map((service) => (
              <Grid item xs={12} key={service.id}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography
                        variant="body1"
                        sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}
                      >
                        {service.name}
                      </Typography>

                      <Chip
                        label={service.status}
                        size="small"
                        sx={{
                          backgroundColor: service.status === 'connected' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: service.status === 'connected' ? '#00e676' : '#f59e0b',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      {service.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );

  const renderBiometricVerification = () => (
    <Card className="oid-biometric-card">
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: 'rgba(255, 255, 255, 0.95)', mb: 3, fontWeight: 600 }}
        >
          {isRTL ? 'التحقق بالقياسات الحيوية' : 'Biometric Verification'}
        </Typography>

        {/* Verification Status */}
        <Box textAlign="center" mb={4}>
          {verificationStatus === 'none' && (
            <Box>
              <Security sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.4)', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isRTL ? 'اختر طريقة التحقق' : 'Select verification method'}
              </Typography>
            </Box>
          )}

          {verificationStatus === 'scanning' && (
            <Box>
              <CircularProgress size={80} sx={{ color: '#0ea5e9', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {isRTL ? 'جاري المسح...' : 'Scanning...'}
              </Typography>
            </Box>
          )}

          {verificationStatus === 'processing' && (
            <Box>
              <CircularProgress size={80} sx={{ color: '#f59e0b', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {isRTL ? 'جاري المعالجة...' : 'Processing...'}
              </Typography>
            </Box>
          )}

          {verificationStatus === 'verified' && (
            <Box>
              <Check sx={{ fontSize: 80, color: '#00e676', mb: 2 }} />
              <Typography sx={{ color: '#00e676', fontWeight: 600 }}>
                {isRTL ? 'تم التحقق بنجاح' : 'Verification Successful'}
              </Typography>
            </Box>
          )}

          {verificationStatus === 'failed' && (
            <Box>
              <Error sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
              <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>
                {isRTL ? 'فشل في التحقق' : 'Verification Failed'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Biometric Options */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleBiometricScan('fingerprint')}
              disabled={verificationStatus === 'scanning' || verificationStatus === 'processing'}
              sx={{
                py: 2,
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(14, 165, 233, 0.1)' }
              }}
            >
              <Fingerprint sx={{ fontSize: 40, color: '#0ea5e9' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {rtl ? 'بصمة الإصبع' : 'Fingerprint Scan'}
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleBiometricScan('face')}
              disabled={verificationStatus === 'scanning' || verificationStatus === 'processing'}
              sx={{
                py: 2,
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
              }}
            >
              <FaceRetouchingNatural sx={{ fontSize: 40, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {rtl ? 'الوجه' : 'Facial Recognition'}
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleBiometricScan('iris')}
              disabled={verificationStatus === 'scanning' || verificationStatus === 'processing'}
              sx={{
                py: 2,
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
              }}
            >
              <RemoveRedEye sx={{ fontSize: 40, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {rtl ? 'بصمة العين' : 'Iris Scan'}
              </Typography>
            </Button>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleBiometricScan('voice')}
              disabled={verificationStatus === 'scanning' || verificationStatus === 'processing'}
              sx={{
                py: 2,
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.1)' }
              }}
            >
              <Psychology sx={{ fontSize: 40, color: '#a855f7' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {rtl ? 'الصوت' : 'Voice Recognition'}
              </Typography>
            </Button>
          </Grid>
        </Grid>

        {verificationStatus === 'verified' && (
          <Alert
            severity="success"
            sx={{
              mt: 3,
              backgroundColor: 'rgba(0, 230, 118, 0.1)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {isRTL
              ? 'تم التحقق من هويتك بنجاح. يمكنك الآن الوصول إلى جميع الخدمات الحكومية.'
              : 'Your identity has been successfully verified. You can now access all government services.'
            }
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  if (!citizenData) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} sx={{ color: '#0ea5e9' }} />
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {isRTL ? 'جاري تحميل بيانات المواطن...' : 'Loading citizen data...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* OID Identity Header */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AccountTree sx={{ fontSize: 40, color: '#0ea5e9' }} />
            <Box>
              <Typography
                variant="h5"
                sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}
              >
                {rtl ? 'نظام الهوية الرقمية السوداني' : 'Sudan Digital Identity System'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {rtl ? 'مدعوم بتقنية المعرف الكائني (OID)' : 'Powered by Object Identifier (OID) Technology'}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.85)', mt: 1 }}>
                {rtl ? 'الملف الشخصي للمواطن' : 'OID-Based Citizen Profile'}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                label={isRTL ? 'رقم المعرف الكائني (OID)' : 'Object Identifier (OID)'}
                value={oidNumber}
                onChange={(e) => setOidNumber(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& input': { color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'monospace' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Search />}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                  py: 1.5
                }}
              >
                {isRTL ? 'البحث والتحقق' : 'Search & Verify'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Citizen Profile */}
        <Grid item xs={12} lg={8}>
          {renderCitizenProfile()}
        </Grid>

        {/* Biometric Verification */}
        <Grid item xs={12} lg={4}>
          {renderBiometricVerification()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OIDIntegration;
