import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Fingerprint,
  Badge,
  Security,
  Verified,
  QrCode2,
  AccountTree,
  Lock,
  CameraAlt,
  Download,
  Upload,
  Shield,
  PrivacyTip,
  AdminPanelSettings,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function IdentityMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);
  const [biometricDialog, setBiometricDialog] = useState(false);

  const identityProfile = {
    name: 'Ahmed Mohammed Ali',
    oid: '1.3.6.1.4.1.61026.1.1.123456',
    nationalId: 'SDN-2024-001234',
    status: 'Verified',
    issuedDate: '2024-01-15',
    expiryDate: '2034-01-15',
    biometricStatus: 'Enrolled',
    securityLevel: 'High',
    avatar: '👤',
  };

  const identityStats = {
    verifications: 847,
    documents: 12,
    accessLogs: 234,
    securityScore: 95,
  };

  const linkedDocuments = [
    {
      type: 'Passport',
      number: 'P12345678',
      status: 'Active',
      expiry: '2030-06-15',
      color: '#2563eb',
      icon: '🛂',
    },
    {
      type: 'Driver License',
      number: 'DL-2024-5678',
      status: 'Active',
      expiry: '2029-03-20',
      color: '#16a34a',
      icon: '🚗',
    },
    {
      type: 'Health Insurance',
      number: 'HI-2024-9012',
      status: 'Active',
      expiry: '2026-12-31',
      color: '#7c3aed',
      icon: '🏥',
    },
  ];

  const recentActivity = [
    {
      action: 'Identity Verification',
      service: 'Banking Portal',
      timestamp: '2026-03-01 14:30',
      status: 'Success',
      location: 'Khartoum',
    },
    {
      action: 'Document Access',
      service: 'Education Ministry',
      timestamp: '2026-02-28 10:15',
      status: 'Success',
      location: 'Khartoum',
    },
    {
      action: 'Biometric Scan',
      service: 'Health Ministry',
      timestamp: '2026-02-27 16:45',
      status: 'Success',
      location: 'Khartoum',
    },
  ];

  const services = [
    {
      title: isRTL ? 'البطاقة الوطنية' : 'National ID Card',
      description: isRTL
        ? 'إصدار وتجديد البطاقة الوطنية الرقمية'
        : 'Issue and renew digital national identity card',
      icon: Badge,
      color: '#1976d2',
      featured: true,
      badge: identityProfile.status,
      stats: [
        { value: 'Active', label: isRTL ? 'الحالة' : 'Status' },
        { value: '10y', label: isRTL ? 'صالحة' : 'Valid' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض البطاقة' : 'View Card',
          onClick: () => {},
        },
        {
          label: isRTL ? 'تنزيل' : 'Download',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'البصمة الحيوية' : 'Biometric Data',
      description: isRTL
        ? 'إدارة بصمات الأصابع والوجه والقزحية'
        : 'Manage fingerprint, facial, and iris biometrics',
      icon: Fingerprint,
      color: '#7c3aed',
      featured: true,
      badge: identityProfile.biometricStatus,
      stats: [
        { value: '3/3', label: isRTL ? 'مسجلة' : 'Enrolled' },
      ],
      actions: [
        {
          label: isRTL ? 'إدارة البصمات' : 'Manage',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'شجرة المعرفات OID' : 'OID Hierarchy',
      description: isRTL
        ? 'عرض وإدارة شجرة المعرفات الوطنية'
        : 'View and manage national OID hierarchy',
      icon: AccountTree,
      color: '#16a34a',
      stats: [
        { value: identityProfile.oid.split('.').length, label: isRTL ? 'مستويات' : 'Levels' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض الشجرة' : 'View Tree',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'التحقق الرقمي' : 'Digital Verification',
      description: isRTL
        ? 'التحقق من هويتك للخدمات الحكومية'
        : 'Verify your identity for government services',
      icon: Verified,
      color: '#2563eb',
      stats: [
        { value: identityStats.verifications, label: isRTL ? 'تحقق' : 'Verified' },
      ],
      actions: [
        {
          label: isRTL ? 'توليد QR' : 'Generate QR',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الأمان والخصوصية' : 'Security & Privacy',
      description: isRTL
        ? 'إدارة إعدادات الأمان والخصوصية'
        : 'Manage security settings and privacy controls',
      icon: Security,
      color: '#dc2626',
      badge: identityProfile.securityLevel,
      stats: [
        { value: `${identityStats.securityScore}%`, label: isRTL ? 'الأمان' : 'Score' },
      ],
      actions: [
        {
          label: isRTL ? 'الإعدادات' : 'Settings',
          onClick: () => setCurrentTab(3),
        },
      ],
    },
    {
      title: isRTL ? 'الوثائق المرتبطة' : 'Linked Documents',
      description: isRTL
        ? 'إدارة الوثائق المرتبطة بهويتك'
        : 'Manage documents linked to your identity',
      icon: AdminPanelSettings,
      color: '#ea580c',
      stats: [
        { value: linkedDocuments.length, label: isRTL ? 'وثيقة' : 'Docs' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض الكل' : 'View All',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -120,
            right: -120,
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box display="flex" alignItems="center" gap={3} mb={2}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '3.5rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.3)',
                }}
              >
                {identityProfile.avatar}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  {identityProfile.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, fontFamily: 'monospace' }}>
                  {identityProfile.nationalId}
                </Typography>
                <Chip
                  icon={<Verified />}
                  label={identityProfile.status}
                  sx={{
                    bgcolor: '#16a34a',
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}>
                {isRTL ? 'معرف OID الوطني' : 'National OID'}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {identityProfile.oid}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'التحققات' : 'Verifications'}
                  value={identityStats.verifications}
                  icon={Verified}
                  color="#16a34a"
                  variant="gradient"
                  trend={{ value: '+12%', direction: 'up' }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الأمان' : 'Security'}
                  value={`${identityStats.securityScore}%`}
                  icon={Shield}
                  color="#7c3aed"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الوثائق' : 'Documents'}
                  value={identityStats.documents}
                  icon={Badge}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'النشاط' : 'Activity'}
                  value={identityStats.accessLogs}
                  subtitle={isRTL ? 'سجل' : 'Logs'}
                  icon={Lock}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<QrCode2 />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'توليد كود QR' : 'Generate QR Code'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Download />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'تنزيل البطاقة' : 'Download ID Card'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<CameraAlt />}
            onClick={() => setBiometricDialog(true)}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'تحديث البصمة' : 'Update Biometric'}
          </Button>
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab label={isRTL ? 'نظرة عامة' : 'Overview'} />
          <Tab label={isRTL ? 'البصمات الحيوية' : 'Biometrics'} />
          <Tab label={isRTL ? 'الوثائق المرتبطة' : 'Linked Documents'} />
          <Tab label={isRTL ? 'الأمان' : 'Security'} />
          <Tab label={isRTL ? 'سجل النشاط' : 'Activity Log'} />
        </Tabs>

        <Box p={3}>
          {/* Overview Tab */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {services.map((service, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <PremiumServiceCard {...service} language={language} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Biometrics Tab */}
          {currentTab === 1 && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                {isRTL
                  ? 'جميع البصمات الحيوية مسجلة ونشطة'
                  : 'All biometric data enrolled and active'}
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, border: '2px solid #e5e7eb' }}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>👆</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {isRTL ? 'بصمة الإصبع' : 'Fingerprint'}
                    </Typography>
                    <Chip label={isRTL ? 'مسجلة' : 'Enrolled'} color="success" sx={{ mb: 2 }} />
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {isRTL ? 'آخر تحديث: 2024-01-15' : 'Last updated: 2024-01-15'}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {isRTL ? 'إعادة المسح' : 'Re-scan'}
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, border: '2px solid #e5e7eb' }}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>😊</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {isRTL ? 'التعرف على الوجه' : 'Facial Recognition'}
                    </Typography>
                    <Chip label={isRTL ? 'مسجلة' : 'Enrolled'} color="success" sx={{ mb: 2 }} />
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {isRTL ? 'آخر تحديث: 2024-01-15' : 'Last updated: 2024-01-15'}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {isRTL ? 'إعادة المسح' : 'Re-scan'}
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3, border: '2px solid #e5e7eb' }}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>👁️</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {isRTL ? 'مسح القزحية' : 'Iris Scan'}
                    </Typography>
                    <Chip label={isRTL ? 'مسجلة' : 'Enrolled'} color="success" sx={{ mb: 2 }} />
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {isRTL ? 'آخر تحديث: 2024-01-15' : 'Last updated: 2024-01-15'}
                    </Typography>
                    <Button variant="outlined" size="small">
                      {isRTL ? 'إعادة المسح' : 'Re-scan'}
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Linked Documents Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'الوثائق المرتبطة بهويتك' : 'Documents Linked to Your Identity'}
              </Typography>

              <Grid container spacing={2}>
                {linkedDocuments.map((doc, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${doc.color}30`,
                        background: `linear-gradient(135deg, ${doc.color}05 0%, #ffffff 100%)`,
                      }}
                    >
                      <Box display="flex" alignItems="start" gap={2}>
                        <Typography sx={{ fontSize: '3rem' }}>{doc.icon}</Typography>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {doc.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {doc.number}
                          </Typography>
                          <Box display="flex" gap={1} mt={2}>
                            <Chip label={doc.status} color="success" size="small" />
                            <Chip label={`Expires: ${doc.expiry}`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        <Button size="small" variant="outlined">
                          {isRTL ? 'عرض' : 'View'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Security Tab */}
          {currentTab === 3 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                {isRTL
                  ? 'درجة الأمان الخاصة بك عالية. واصل الممارسات الجيدة!'
                  : 'Your security score is high. Keep up the good practices!'}
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {isRTL ? 'إعدادات الخصوصية' : 'Privacy Settings'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemText
                          primary={isRTL ? 'مشاركة البيانات مع الوزارات' : 'Data sharing with ministries'}
                          secondary={isRTL ? 'السماح للوزارات بالوصول لبياناتك' : 'Allow ministries to access your data'}
                        />
                        <Chip label={isRTL ? 'مفعل' : 'Enabled'} color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={isRTL ? 'التحقق ثنائي العامل' : 'Two-factor authentication'}
                          secondary={isRTL ? 'طبقة أمان إضافية' : 'Extra security layer'}
                        />
                        <Chip label={isRTL ? 'مفعل' : 'Enabled'} color="success" size="small" />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={isRTL ? 'إشعارات الوصول' : 'Access notifications'}
                          secondary={isRTL ? 'تنبيهات عند استخدام هويتك' : 'Alerts when identity is used'}
                        />
                        <Chip label={isRTL ? 'مفعل' : 'Enabled'} color="success" size="small" />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                      {isRTL ? 'إدارة كلمة المرور' : 'Password Management'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      fullWidth
                      type="password"
                      label={isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label={isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      margin="normal"
                    />
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                      {isRTL ? 'تحديث كلمة المرور' : 'Update Password'}
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Activity Log Tab */}
          {currentTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'آخر الأنشطة' : 'Recent Activity'}
              </Typography>

              <List>
                {recentActivity.map((activity, idx) => (
                  <Box key={idx}>
                    <ListItem
                      sx={{
                        bgcolor: '#f9fafb',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {activity.action}
                            </Typography>
                            <Chip
                              label={activity.status}
                              size="small"
                              color={activity.status === 'Success' ? 'success' : 'error'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="text.secondary">
                              {activity.service} • {activity.location}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Biometric Dialog */}
      <Dialog open={biometricDialog} onClose={() => setBiometricDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isRTL ? 'تحديث البصمة الحيوية' : 'Update Biometric Data'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {isRTL
              ? 'يرجى زيارة أقرب مركز خدمات لتحديث بصماتك الحيوية'
              : 'Please visit the nearest service center to update your biometric data'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {isRTL
              ? 'يمكنك حجز موعد أو العثور على أقرب مركز خدمات من خلال الزر أدناه'
              : 'You can book an appointment or find the nearest service center using the button below'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBiometricDialog(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained">
            {isRTL ? 'حجز موعد' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
