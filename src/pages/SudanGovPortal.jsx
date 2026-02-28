import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
  AccountTree,
  Dashboard,
  LocalHospital,
  School,
  AccountBalance,
  Agriculture,
  ElectricBolt,
  LocationCity,
  Gavel,
  Public,
  Work,
  VolunteerActivism,
  Person,
  Notifications,
  Settings,
  Analytics,
  TrendingUp,
  Support,
  CloudQueue,
  Verified,
  MonitorHeart,
  ReportProblem as Emergency,
  Menu,
  Search,
  Chat as ChatIcon,
  Fingerprint as BiometricIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Chip,
  LinearProgress,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';

import '../styles/sudan-government.css';

import { registerBiometric, authenticateBiometric } from '../api/biometric-api';
import { MINISTRY_OIDS, OID_BRANCHES } from '../config/oidConfig';

const AgricultureMinistryPortal = React.lazy(() => import('../components/AgricultureMinistryPortal'));
const EducationMinistryPortal = React.lazy(() => import('../components/EducationMinistryPortal'));
const FinanceMinistryPortal = React.lazy(() => import('../components/FinanceMinistryPortal'));
const HealthMinistryPortal = React.lazy(() => import('../components/HealthMinistryPortal'));
const EnergyMinistryPortal = React.lazy(() => import('../components/EnergyMinistryPortal'));
const IdentityMinistryPortal = React.lazy(() => import('../components/IdentityMinistryPortal'));
const InfrastructureMinistryPortal = React.lazy(() => import('../components/InfrastructureMinistryPortal'));
const JusticeMinistryPortal = React.lazy(() => import('../components/JusticeMinistryPortal'));
const ForeignAffairsMinistryPortal = React.lazy(() => import('../components/ForeignAffairsMinistryPortal'));
const LaborMinistryPortal = React.lazy(() => import('../components/LaborMinistryPortal'));
const SocialWelfareMinistryPortal = React.lazy(() => import('../components/SocialWelfareMinistryPortal'));
const OidTreeIntegration = React.lazy(() => import('../components/OidTreeIntegration'));
const ChatWidget = React.lazy(() => import('../components/ChatWidget'));
const AnalyticsDashboard = React.lazy(() => import('../components/AnalyticsDashboard'));
const FeedbackForm = React.lazy(() => import('../components/FeedbackForm'));

const governmentDepartments = [
    {
      id: 'identity',
      name: 'Citizen Identity & Civil Registry',
      nameShort: 'Civil Registry',
      icon: <Person />,
      color: '#1B3A5C',
      priority: 'critical',
      oidBranch: MINISTRY_OIDS.identity,
      services: ['Digital ID Registration', 'Birth Certificates', 'Death Certificates', 'Marriage Registration', 'Biometric Services'],
      metrics: { users: 12500000, transactions: 45600, satisfaction: 4.8 }
    },
    {
      id: 'health',
      name: 'Health & Population Systems',
      nameShort: 'Health',
      icon: <LocalHospital />,
      color: '#006B45',
      priority: 'critical',
      oidBranch: MINISTRY_OIDS.health,
      services: ['Medical Records', 'Hospital Management', 'Disease Surveillance', 'Vaccination Records', 'Telemedicine'],
      metrics: { users: 8900000, transactions: 78900, satisfaction: 4.6 }
    },
    {
      id: 'education',
      name: 'Education Ministry',
      nameShort: 'Education',
      icon: <School />,
      color: '#2B2FA8',
      priority: 'high',
      oidBranch: MINISTRY_OIDS.education,
      services: ['Student Registration', 'Digital Certificates', 'Online Learning', 'Teacher Management', 'Exam Systems'],
      metrics: { users: 6700000, transactions: 34500, satisfaction: 4.5 }
    },
    {
      id: 'finance',
      name: 'Finance & Economy',
      nameShort: 'Finance',
      icon: <AccountBalance />,
      color: '#7A4B0A',
      priority: 'critical',
      oidBranch: MINISTRY_OIDS.finance,
      services: ['Tax Collection', 'Government Payments', 'Budget Management', 'E-Procurement', 'Revenue Systems'],
      metrics: { users: 2300000, transactions: 189000, satisfaction: 4.3 }
    },
    {
      id: 'agriculture',
      name: 'Agriculture Ministry',
      nameShort: 'Agriculture',
      icon: <Agriculture />,
      color: '#1D6330',
      priority: 'high',
      oidBranch: MINISTRY_OIDS.agriculture,
      services: ['Farmer Registration', 'Crop Monitoring', 'Subsidies Management', 'Market Information', 'Weather Services'],
      metrics: { users: 4500000, transactions: 67800, satisfaction: 4.4 }
    },
    {
      id: 'energy',
      name: 'Energy & Natural Resources',
      nameShort: 'Energy',
      icon: <ElectricBolt />,
      color: '#7A5200',
      priority: 'high',
      oidBranch: MINISTRY_OIDS.energy,
      services: ['Utility Management', 'Solar Systems', 'Mining Permits', 'Environmental Monitoring', 'Energy Efficiency'],
      metrics: { users: 1800000, transactions: 23400, satisfaction: 4.2 }
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure & Urban Planning',
      nameShort: 'Infrastructure',
      icon: <LocationCity />,
      color: '#3D1F8C',
      priority: 'medium',
      oidBranch: MINISTRY_OIDS.infrastructure,
      services: ['Building Permits', 'Urban Planning', 'Road Management', 'Water Systems', 'Smart City'],
      metrics: { users: 890000, transactions: 12300, satisfaction: 4.1 }
    },
    {
      id: 'justice',
      name: 'Justice & Legal Systems',
      nameShort: 'Justice',
      icon: <Gavel />,
      color: '#8B1A1A',
      priority: 'medium',
      oidBranch: MINISTRY_OIDS.justice,
      services: ['Court Records', 'Legal Documentation', 'Case Management', 'Legal Aid', 'Dispute Resolution'],
      metrics: { users: 450000, transactions: 8900, satisfaction: 4.0 }
    },
    {
      id: 'foreign_affairs',
      name: 'Foreign Affairs',
      nameShort: 'Foreign Affairs',
      icon: <Public />,
      color: '#055F4A',
      priority: 'medium',
      oidBranch: MINISTRY_OIDS.foreignAffairs,
      services: ['Passport Services', 'Visa Processing', 'Diplomatic Services', 'Travel Documentation', 'Consular Services'],
      metrics: { users: 850000, transactions: 19800, satisfaction: 4.3 }
    },
    {
      id: 'labor',
      name: 'Labor & Employment',
      nameShort: 'Labor',
      icon: <Work />,
      color: '#0D4A6B',
      priority: 'medium',
      oidBranch: MINISTRY_OIDS.labor,
      services: ['Job Matching', 'Skills Development', 'Labor Rights', 'Work Permits', 'Training Programs'],
      metrics: { users: 3400000, transactions: 45600, satisfaction: 4.2 }
    },
    {
      id: 'social_welfare',
      name: 'Social Welfare',
      nameShort: 'Social Welfare',
      icon: <VolunteerActivism />,
      color: '#6B1841',
      priority: 'high',
      oidBranch: MINISTRY_OIDS.socialWelfare,
      services: ['Social Benefits', 'Cash Transfers', 'Disability Services', 'Elderly Care', 'Child Protection'],
      metrics: { users: 2800000, transactions: 67800, satisfaction: 4.1 }
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      nameShort: 'Analytics',
      icon: <Analytics />,
      color: '#374151',
      priority: 'system',
      oidBranch: `${OID_BRANCHES.digitalServices}.90`,
      services: ['System Insights', 'Predictive Analytics', 'Performance Metrics'],
      metrics: { users: 0, transactions: 0, satisfaction: 0 }
    },
    {
      id: 'feedback',
      name: 'Citizen Feedback',
      nameShort: 'Feedback',
      icon: <FeedbackIcon />,
      color: '#1D6330',
      priority: 'medium',
      oidBranch: `${OID_BRANCHES.digitalServices}.91`,
      services: ['Submit Feedback', 'Track Feedback', 'View FAQs'],
      metrics: { users: 0, transactions: 0, satisfaction: 0 }
    }
  ];

const SudanGovPortal = ({ language, user } = {}) => {
  const [isRTL, setIsRTL] = useState(language === 'ar');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('dashboard');
  const [userRole] = useState('citizen'); // citizen, official, admin - setUserRole available for future use
  // const [currentTab, setCurrentTab] = useState(0); // Available for future tabbed interface
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBiometricDialogOpen, setIsBiometricDialogOpen] = useState(false);
  const [biometricUsername, setBiometricUsername] = useState('');
  const [biometricMessage, setBiometricMessage] = useState('');
  const [governmentMetrics, setGovernmentMetrics] = useState({
    citizensRegistered: 12500000,
    servicesDigitalized: 847,
    transactionsToday: 156000,
    satisfactionScore: 4.7,
    systemUptime: 99.8
  });

  // Sync isRTL with language prop changes
  useEffect(() => {
    setIsRTL(language === 'ar');
  }, [language]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dashboard metrics and status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGovernmentMetrics(prev => ({
        ...prev,
        transactionsToday: prev.transactionsToday + Math.floor(Math.random() * 100),
        systemUptime: Math.min(99.9, prev.systemUptime + (Math.random() - 0.5) * 0.01)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Notification system
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: isRTL ? 'تحديث النظام' : 'System Update',
        message: isRTL ? 'سيتم إجراء صيانة النظام غداً' : 'System maintenance scheduled for tomorrow',
        type: 'info',
        timestamp: Date.now() - 300000
      },
      {
        id: 2,
        title: isRTL ? 'خدمة جديدة' : 'New Service',
        message: isRTL ? 'تم إطلاق خدمة تجديد الجواز الإلكتروني' : 'Electronic passport renewal service launched',
        type: 'success',
        timestamp: Date.now() - 600000
      },
      {
        id: 3,
        title: isRTL ? 'تنبيه أمني' : 'Security Alert',
        message: isRTL ? 'تم اكتشاف محاولة وصول غير مصرح به' : 'Unauthorized access attempt detected',
        type: 'warning',
        timestamp: Date.now() - 900000
      }
    ];
    
    setNotifications(mockNotifications);
  }, [isRTL]);

  const handleDepartmentChange = useCallback((departmentId) => {
    setSelectedDepartment(departmentId);
    setMobileMenuOpen(false);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleBiometricRegister = async () => {
    setBiometricMessage('Attempting biometric registration...');
    const result = await registerBiometric(biometricUsername);
    setBiometricMessage(result.message);
  };

  const handleBiometricAuthenticate = async () => {
    setBiometricMessage('Attempting biometric authentication...');
    const result = await authenticateBiometric(biometricUsername);
    setBiometricMessage(result.message);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#C8102E';
      case 'high':     return '#B45309';
      case 'medium':   return '#1B3A5C';
      default:         return '#6B7280';
    }
  };

  const renderDepartmentCard = useCallback((department) => (
    <Card
      key={department.id}
      role="button"
      tabIndex={0}
      aria-label={department.name}
      style={{ minHeight: '44px' }}
      className="sudan-department-card"
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${department.color}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        },
      }}
      onClick={() => handleDepartmentChange(department.id)}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: `${department.color}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: department.color,
            }}
          >
            {department.icon}
          </Box>
          <Chip
            label={department.priority}
            size="small"
            sx={{
              bgcolor: `${getPriorityColor(department.priority)}12`,
              color: getPriorityColor(department.priority),
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              height: 20,
              borderRadius: 1,
            }}
          />
        </Box>

        <Typography
          variant="subtitle1"
          sx={{ color: '#111827', fontWeight: 700, mb: 0.5, lineHeight: 1.35 }}
        >
          {department.name}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: '#6B7280', display: 'block', mb: 1.5, lineHeight: 1.5 }}
        >
          {department.services.slice(0, 3).join(' · ')}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            {isRTL ? 'المستخدمون النشطون' : 'Active Users'}
          </Typography>
          <Typography variant="caption" sx={{ color: department.color, fontWeight: 600 }}>
            {(department.metrics.users / 1000000).toFixed(1)}M
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={(department.metrics.users / 12500000) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: '#F3F4F6',
            '& .MuiLinearProgress-bar': { bgcolor: department.color },
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#007A3D' }} />
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {isRTL ? 'متاح' : 'Online'}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            ★ {department.metrics.satisfaction}/5
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ), [isRTL, handleDepartmentChange]);

  const renderSystemStatusDashboard = () => (
    <Grid container spacing={3}>
      {/* System Overview Cards */}
      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card" sx={{ borderTop: '3px solid #1B3A5C' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Analytics sx={{ fontSize: 40, color: '#1B3A5C', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700 }}>
              {(governmentMetrics.citizensRegistered / 1000000).toFixed(1)}M
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {isRTL ? 'مواطن نشط' : 'Active Citizens'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(governmentMetrics.citizensRegistered / 45000000) * 100}
              sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: '#F3F4F6', '& .MuiLinearProgress-bar': { bgcolor: '#1B3A5C' } }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card" sx={{ borderTop: '3px solid #007A3D' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <CloudQueue sx={{ fontSize: 40, color: '#007A3D', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700 }}>
              {(governmentMetrics.transactionsToday / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {isRTL ? 'المعاملات اليومية' : 'Daily Transactions'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#007A3D', mt: 1, display: 'block', fontWeight: 600 }}>
              {isRTL ? '↗ +15% من الأمس' : '↗ +15% from yesterday'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card" sx={{ borderTop: '3px solid #1B3A5C' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <MonitorHeart sx={{ fontSize: 40, color: '#1B3A5C', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700 }}>
              {governmentMetrics.systemUptime.toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {isRTL ? 'وقت التشغيل' : 'System Uptime'}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={0.75} mt={1}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#007A3D' }} />
              <Typography variant="caption" sx={{ color: '#007A3D', fontWeight: 600 }}>
                {isRTL ? 'صحي' : 'Healthy'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card" sx={{ borderTop: '3px solid #B45309' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <TrendingUp sx={{ fontSize: 40, color: '#B45309', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700 }}>
              {governmentMetrics.satisfactionScore.toFixed(1)}/5
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
              {isRTL ? 'رضا الخدمة' : 'Service Satisfaction'}
            </Typography>
            <Chip
              label={isRTL ? 'ممتاز' : 'Excellent'}
              size="small"
              sx={{ mt: 1, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600, height: 22, borderRadius: 1 }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Department Grid */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, mb: 2.5 }}>
          {isRTL ? 'الوزارات والإدارات الحكومية' : 'Government Ministries & Departments'}
        </Typography>
        <Grid container spacing={2}>
          {governmentDepartments.map((department) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={department.id}>
              {renderDepartmentCard(department)}
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card className="sudan-quick-actions">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#111827', mb: 2, fontWeight: 700 }}>
              {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<Emergency />}
                  className="sudan-action-btn emergency" style={{ minHeight: '44px' }}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => handleDepartmentChange('identity')}>
                  {isRTL ? 'خدمات الطوارئ' : 'Emergency Services'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<Verified />}
                  className="sudan-action-btn" style={{ minHeight: '44px' }}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => handleDepartmentChange('identity')}>
                  {isRTL ? 'التحقق من الهوية' : 'ID Verification'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<Analytics />}
                  className="sudan-action-btn" style={{ minHeight: '44px' }}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => handleDepartmentChange('identity')}>
                  {isRTL ? 'طلب وثيقة' : 'Document Request'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<AccountBalance />}
                  className="sudan-action-btn" style={{ minHeight: '44px' }}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => handleDepartmentChange('finance')}>
                  {isRTL ? 'خدمات الدفع' : 'Payment Services'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="outlined" startIcon={<BiometricIcon />}
                  className="sudan-action-btn" style={{ minHeight: '44px' }}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => setIsBiometricDialogOpen(true)}>
                  {isRTL ? 'تسجيل الدخول بالبصمة' : 'Login with Biometrics'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSelectedDepartment = (departmentId) => {
    const language = isRTL ? 'ar' : 'en';
    switch (departmentId) {
      case 'identity':
        return <IdentityMinistryPortal language={language} />;
      case 'health':
        return <HealthMinistryPortal language={language} />;
      case 'education':
        return <EducationMinistryPortal language={language} />;
      case 'finance':
        return <FinanceMinistryPortal language={language} />;
      case 'agriculture':
        return <AgricultureMinistryPortal language={language} />;
      case 'energy':
        return <EnergyMinistryPortal language={language} />;
      case 'infrastructure':
        return <InfrastructureMinistryPortal language={language} />;
      case 'justice':
        return <JusticeMinistryPortal language={language} />;
      case 'foreign_affairs':
        return <ForeignAffairsMinistryPortal language={language} />;
      case 'labor':
        return <LaborMinistryPortal language={language} />;
      case 'social_welfare':
        return <SocialWelfareMinistryPortal language={language} />;
      case 'oid_tree':
        return <OidTreeIntegration language={language} user={user} />;
      case 'analytics':
        return <AnalyticsDashboard language={language} />;
      case 'feedback':
        return <FeedbackForm language={language} />;
      default:
        return (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {isRTL
              ? 'هذا القسم قيد التطوير. سيتم إضافة المزيد من الميزات قريباً.'
              : 'This department section is under development. More features will be added soon.'
            }
          </Alert>
        );
    }
  };

  const activeDepartment = governmentDepartments.find((department) => department.id === selectedDepartment);

  return (
    <Box
      data-testid="gov-portal-container"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F5F7FA',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Navigation Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRight: '1px solid #E5E7EB',
          },
          display: { xs: 'none', md: 'block' }
        }}
      >
        {/* Logo and Header */}
        <Box sx={{ p: 3, background: '#1B3A5C', borderBottom: '1px solid #0F2640' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #dc2626 0%, #000000 50%, #ffffff 100%)',
                fontSize: '1.5rem'
              }}
            >
              🇸🇩
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700, fontSize: '1.1rem' }}
              >
                {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}
              >
                {isRTL ? 'البوابة الحكومية الرقمية' : 'Digital Government Portal'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Menu */}
        <List sx={{ p: 2 }}>
          <ListItem
            button
            style={{ minHeight: '44px' }}
            selected={selectedDepartment === 'dashboard'}
            onClick={() => handleDepartmentChange('dashboard')}
            className="sudan-nav-item"
          >
            <ListItemIcon>
              <Dashboard sx={{ color: '#1B3A5C' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'لوحة المراقبة' : 'Dashboard'}
              sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }}
            />
          </ListItem>

          <ListItem
            button
            style={{ minHeight: '44px' }}
            selected={selectedDepartment === 'oid_tree'}
            onClick={() => handleDepartmentChange('oid_tree')}
            className="sudan-nav-item"
          >
            <ListItemIcon>
              <AccountTree sx={{ color: '#1B3A5C' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'شجرة المعرفات الذكية' : 'OID Tree'}
              sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }}
            />
          </ListItem>

          <Divider sx={{ my: 1, borderColor: '#E5E7EB' }} />

          {governmentDepartments.map((department) => (
            <ListItem
              key={department.id}
              button
              style={{ minHeight: '44px' }}
              selected={selectedDepartment === department.id}
              onClick={() => handleDepartmentChange(department.id)}
              className="sudan-nav-item"
            >
              <ListItemIcon sx={{ color: department.color }}>
                {department.icon}
              </ListItemIcon>
              <ListItemText
                primary={isRTL ? department.nameShort.ar : department.nameShort}
                sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }}
              />
              <Chip
                label={department.metrics ? `${Math.round(department.metrics.users / 10000) / 100}M` : ''}
                size="small"
                sx={{
                  backgroundColor: `${department.color}20`,
                  color: department.color,
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </ListItem>
          ))}

          <Divider sx={{ my: 1, borderColor: '#E5E7EB' }} />

          <ListItem button style={{ minHeight: '44px' }} className="sudan-nav-item" onClick={() => handleDepartmentChange('feedback')}>
            <ListItemIcon>
              <Settings sx={{ color: '#6B7280' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'الإعدادات' : 'Settings'}
              sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }}
            />
          </ListItem>

          <ListItem button style={{ minHeight: '44px' }} className="sudan-nav-item" onClick={() => handleDepartmentChange('feedback')}>
            <ListItemIcon>
              <Support sx={{ color: '#6B7280' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'الدعم الفني' : 'Support'}
              sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }}
            />
          </ListItem>
        </List>

        {/* System Status Footer */}
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #E5E7EB' }}>
          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
            {isRTL ? 'حالة النظام' : 'System Status'}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#007A3D' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'النظام يعمل بشكل طبيعي' : 'All systems operational'}
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {isRTL ? 'آخر تحديث: منذ دقائق قليلة' : 'Last updated: few minutes ago'}
          </Typography>
        </Box>
      </Drawer>

      {/* Mobile Navigation */}
      <Drawer
        variant="temporary"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E5E7EB',
          }
        }}
      >
        {/* Same navigation content as desktop sidebar */}
        <Box sx={{ p: 3, background: '#1B3A5C', borderBottom: '1px solid #0F2640' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 50, height: 50, background: '#1B3A5C', fontSize: '1.5rem' }}>
              🇸🇩
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700, fontSize: '1.1rem' }}>
                {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                {isRTL ? 'البوابة الحكومية الرقمية' : 'Digital Government Portal'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <List sx={{ p: 2 }}>
          <ListItem button style={{ minHeight: '44px' }} selected={selectedDepartment === 'dashboard'} onClick={() => handleDepartmentChange('dashboard')} className="sudan-nav-item">
            <ListItemIcon><Dashboard sx={{ color: '#1B3A5C' }} /></ListItemIcon>
            <ListItemText primary={isRTL ? 'لوحة المراقبة' : 'Dashboard'} sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }} />
          </ListItem>
          <ListItem button style={{ minHeight: '44px' }} selected={selectedDepartment === 'oid_tree'} onClick={() => handleDepartmentChange('oid_tree')} className="sudan-nav-item">
            <ListItemIcon><AccountTree sx={{ color: '#1B3A5C' }} /></ListItemIcon>
            <ListItemText primary={isRTL ? 'شجرة المعرفات الذكية' : 'OID Tree'} sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }} />
          </ListItem>
          <Divider sx={{ my: 1, borderColor: '#E5E7EB' }} />
          {governmentDepartments.map((department) => (
            <ListItem key={department.id} button style={{ minHeight: '44px' }} selected={selectedDepartment === department.id} onClick={() => handleDepartmentChange(department.id)} className="sudan-nav-item">
              <ListItemIcon sx={{ color: department.color }}>{department.icon}</ListItemIcon>
              <ListItemText primary={isRTL ? department.nameShort.ar : department.nameShort} sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1, borderColor: '#E5E7EB' }} />
          <ListItem button style={{ minHeight: '44px' }} className="sudan-nav-item" onClick={() => handleDepartmentChange('feedback')}>
            <ListItemIcon><Settings sx={{ color: '#6B7280' }} /></ListItemIcon>
            <ListItemText primary={isRTL ? 'الإعدادات' : 'Settings'} sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }} />
          </ListItem>
          <ListItem button style={{ minHeight: '44px' }} className="sudan-nav-item" onClick={() => handleDepartmentChange('feedback')}>
            <ListItemIcon><Support sx={{ color: '#6B7280' }} /></ListItemIcon>
            <ListItemText primary={isRTL ? 'الدعم الفني' : 'Support'} sx={{ '& .MuiTypography-root': { color: '#1C2B3A', fontSize: '0.875rem' } }} />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        role="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: '#F5F7FA'
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#1B3A5C',
            borderBottom: '2px solid #0F2640',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            {/* Mobile Menu Toggle */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              style={{ minHeight: '44px' }}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <Menu />
            </IconButton>

            {/* Search Bar */}
            <TextField
              size="small"
              placeholder={isRTL ? 'البحث في الخدمات الحكومية...' : 'Search government services...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 400,
                maxWidth: '50%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1.5,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
                },
                '& input': { color: '#FFFFFF', '&::placeholder': { color: 'rgba(255,255,255,0.5)' } },
              }}
              InputProps={{
                startAdornment: (
                  <IconButton
                    data-testid="search-button"
                    size="small"
                    style={{ minHeight: '44px' }}
                    sx={{ color: 'rgba(255,255,255,0.65)', mr: 0.5 }}
                    aria-label={isRTL ? 'بحث' : 'Search'}
                  >
                    <Search />
                  </IconButton>
                )
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            {/* Action Buttons */}
            <Box display="flex" alignItems="center" gap={1}>
              {/* Language Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={isRTL}
                    onChange={(e) => setIsRTL(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {isRTL ? 'AR' : 'EN'}
                  </Typography>
                }
              />

              {/* Notifications */}
              <IconButton style={{ minHeight: '44px' }} sx={{ color: 'rgba(255,255,255,0.9)' }} aria-label="notifications">
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* System Status */}
              <IconButton style={{ minHeight: '44px' }} sx={{ color: 'rgba(255,255,255,0.9)' }} aria-label="system status">
                <MonitorHeart />
              </IconButton>

              {/* User Profile */}
              {user?.name && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mr: 1 }}>
                  {user.name}
                </Typography>
              )}
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: '#C8102E',
                  fontSize: '0.9rem'
                }}
                aria-label={user?.name || (userRole === 'citizen' ? 'Citizen' : 'User')}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : userRole === 'citizen' ? 'C' : 'A'}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {!isOnline && (
          <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
            {isRTL ? 'أنت غير متصل بالإنترنت. قد تكون بعض الميزات غير متاحة.' : 'You are offline. Some features may be unavailable.'}
          </Alert>
        )}

        {/* Page Content */}
        <Suspense fallback={<CircularProgress />}>
          <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            {selectedDepartment === 'dashboard' && renderSystemStatusDashboard()}
            
            {selectedDepartment !== 'dashboard' && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{ color: '#111827', fontWeight: 700, mb: 3 }}
                >
                  {activeDepartment?.name || 'Department'}
                </Typography>

                {activeDepartment && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1,
                      mb: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={activeDepartment.oidBranch}
                      aria-label={`OID Branch: ${activeDepartment.oidBranch}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: 'rgba(255,255,255,0.9)',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Chip
                      label={`${activeDepartment.services.length} ${isRTL ? 'خدمات' : 'services'}`}
                      aria-label={`${activeDepartment.services.length} ${isRTL ? 'خدمات الوزارة' : 'ministry services'}`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ px: { xs: 0, md: 1 } }}>
                  {renderSelectedDepartment(selectedDepartment)}
                </Box>
              </Box>
            )}
          </Container>
        </Suspense>

        <Fab 
          color="primary" 
          aria-label="chat" 
          onClick={toggleChat} 
          style={{ minHeight: '44px' }}
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        >
          <ChatIcon />
        </Fab>

        {isChatOpen && <ChatWidget user={{ name: 'Citizen' }} onClose={toggleChat} />}

        {/* Biometric Authentication Dialog */}
        <Dialog open={isBiometricDialogOpen} onClose={() => setIsBiometricDialogOpen(false)}>
          <DialogTitle>{isRTL ? 'المصادقة البيومترية' : 'Biometric Authentication'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label={isRTL ? 'اسم المستخدم' : 'Username'}
              type="text"
              fullWidth
              variant="standard"
              value={biometricUsername}
              onChange={(e) => setBiometricUsername(e.target.value)}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {biometricMessage}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button style={{ minHeight: '44px' }} onClick={() => setIsBiometricDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button style={{ minHeight: '44px' }} onClick={handleBiometricRegister}>{isRTL ? 'تسجيل' : 'Register'}</Button>
            <Button style={{ minHeight: '44px' }} onClick={handleBiometricAuthenticate}>{isRTL ? 'مصادقة' : 'Authenticate'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SudanGovPortal;
