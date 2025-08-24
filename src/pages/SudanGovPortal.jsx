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
  AdminPanelSettings,
  Notifications,
  Language,
  Settings,
  Security,
  Analytics,
  Schedule,
  Support,
  TrendingUp,
  Groups,
  Assignment,
  CloudQueue,
  Verified,
  MonitorHeart,
  Psychology,
  Science,
  Emergency,
  Menu,
  Close,
  Search,
  FilterList,
  Sort,
  Refresh,
  CloudSync,
  NotificationImportant,
  Shield,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Container,
  Fade,
  Slide,
  Tooltip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';

import '../styles/sudan-government.css';

import { registerBiometric, authenticateBiometric } from '../api/biometric-api';

const AgricultureMinistryPortal = React.lazy(() => import('../components/AgricultureMinistryPortal'));
const EducationMinistryPortal = React.lazy(() => import('../components/EducationMinistryPortal'));
const FinanceMinistryPortal = React.lazy(() => import('../components/FinanceMinistryPortal'));
const HealthMinistryPortal = React.lazy(() => import('../components/HealthMinistryPortal'));
const EnergyMinistryPortal = React.lazy(() => import('../components/EnergyMinistryPortal'));
const InfrastructureMinistryPortal = React.lazy(() => import('../components/InfrastructureMinistryPortal'));
const JusticeMinistryPortal = React.lazy(() => import('../components/JusticeMinistryPortal'));
const ForeignAffairsMinistryPortal = React.lazy(() => import('../components/ForeignAffairsMinistryPortal'));
const LaborMinistryPortal = React.lazy(() => import('../components/LaborMinistryPortal'));
const SocialWelfareMinistryPortal = React.lazy(() => import('../components/SocialWelfareMinistryPortal'));
const ChatWidget = React.lazy(() => import('../components/ChatWidget'));
const AnalyticsDashboard = React.lazy(() => import('../components/AnalyticsDashboard'));
const FeedbackForm = React.lazy(() => import('../components/FeedbackForm'));

const governmentDepartments = [
    {
      id: 'identity',
      name: 'Citizen Identity & Civil Registry',
      nameShort: 'Civil Registry',
      icon: <Person />,
      color: '#0ea5e9',
      priority: 'critical',
      oidBranch: '1.3.6.1.4.1.61026.1.1',
      services: ['Digital ID Registration', 'Birth Certificates', 'Death Certificates', 'Marriage Registration', 'Biometric Services'],
      metrics: { users: 12500000, transactions: 45600, satisfaction: 4.8 }
    },
    {
      id: 'health',
      name: 'Health & Population Systems',
      nameShort: 'Health',
      icon: <LocalHospital />,
      color: '#10b981',
      priority: 'critical',
      oidBranch: '1.3.6.1.4.1.61026.1.2',
      services: ['Medical Records', 'Hospital Management', 'Disease Surveillance', 'Vaccination Records', 'Telemedicine'],
      metrics: { users: 8900000, transactions: 78900, satisfaction: 4.6 }
    },
    {
      id: 'education',
      name: 'Education Ministry',
      nameShort: 'Education',
      icon: <School />,
      color: '#6366f1',
      priority: 'high',
      oidBranch: '1.3.6.1.4.1.61026.1.3',
      services: ['Student Registration', 'Digital Certificates', 'Online Learning', 'Teacher Management', 'Exam Systems'],
      metrics: { users: 6700000, transactions: 34500, satisfaction: 4.5 }
    },
    {
      id: 'finance',
      name: 'Finance & Economy',
      nameShort: 'Finance',
      icon: <AccountBalance />,
      color: '#f59e0b',
      priority: 'critical',
      oidBranch: '1.3.6.1.4.1.61026.1.4',
      services: ['Tax Collection', 'Government Payments', 'Budget Management', 'E-Procurement', 'Revenue Systems'],
      metrics: { users: 2300000, transactions: 189000, satisfaction: 4.3 }
    },
    {
      id: 'agriculture',
      name: 'Agriculture Ministry',
      nameShort: 'Agriculture',
      icon: <Agriculture />,
      color: '#22c55e',
      priority: 'high',
      oidBranch: '1.3.6.1.4.1.61026.1.5',
      services: ['Farmer Registration', 'Crop Monitoring', 'Subsidies Management', 'Market Information', 'Weather Services'],
      metrics: { users: 4500000, transactions: 67800, satisfaction: 4.4 }
    },
    {
      id: 'energy',
      name: 'Energy & Natural Resources',
      nameShort: 'Energy',
      icon: <ElectricBolt />,
      color: '#eab308',
      priority: 'high',
      oidBranch: '1.3.6.1.4.1.61026.1.6',
      services: ['Utility Management', 'Solar Systems', 'Mining Permits', 'Environmental Monitoring', 'Energy Efficiency'],
      metrics: { users: 1800000, transactions: 23400, satisfaction: 4.2 }
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure & Urban Planning',
      nameShort: 'Infrastructure',
      icon: <LocationCity />,
      color: '#8b5cf6',
      priority: 'medium',
      oidBranch: '1.3.6.1.4.1.61026.1.7',
      services: ['Building Permits', 'Urban Planning', 'Road Management', 'Water Systems', 'Smart City'],
      metrics: { users: 890000, transactions: 12300, satisfaction: 4.1 }
    },
    {
      id: 'justice',
      name: 'Justice & Legal Systems',
      nameShort: 'Justice',
      icon: <Gavel />,
      color: '#dc2626',
      priority: 'medium',
      oidBranch: '1.3.6.1.4.1.61026.1.8',
      services: ['Court Records', 'Legal Documentation', 'Case Management', 'Legal Aid', 'Dispute Resolution'],
      metrics: { users: 450000, transactions: 8900, satisfaction: 4.0 }
    },
    {
      id: 'foreign_affairs',
      name: 'Foreign Affairs',
      nameShort: 'Foreign Affairs',
      icon: <Public />,
      color: '#059669',
      priority: 'medium',
      oidBranch: '1.3.6.1.4.1.61026.1.9',
      services: ['Passport Services', 'Visa Processing', 'Diplomatic Services', 'Travel Documentation', 'Consular Services'],
      metrics: { users: 850000, transactions: 19800, satisfaction: 4.3 }
    },
    {
      id: 'labor',
      name: 'Labor & Employment',
      nameShort: 'Labor',
      icon: <Work />,
      color: '#0891b2',
      priority: 'medium',
      oidBranch: '1.3.6.1.4.1.61026.1.10',
      services: ['Job Matching', 'Skills Development', 'Labor Rights', 'Work Permits', 'Training Programs'],
      metrics: { users: 3400000, transactions: 45600, satisfaction: 4.2 }
    },
    {
      id: 'social_welfare',
      name: 'Social Welfare',
      nameShort: 'Social Welfare',
      icon: <VolunteerActivism />,
      color: '#be185d',
      priority: 'high',
      oidBranch: '1.3.6.1.4.1.61026.1.11',
      services: ['Social Benefits', 'Cash Transfers', 'Disability Services', 'Elderly Care', 'Child Protection'],
      metrics: { users: 2800000, transactions: 67800, satisfaction: 4.1 }
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      nameShort: 'Analytics',
      icon: <Analytics />,
      color: '#ffffff',
      priority: 'system',
      oidBranch: '1.3.6.1.4.1.61026.1.12',
      services: ['System Insights', 'Predictive Analytics', 'Performance Metrics'],
      metrics: { users: 0, transactions: 0, satisfaction: 0 }
    },
    {
      id: 'feedback',
      name: 'Citizen Feedback',
      nameShort: 'Feedback',
      icon: <FeedbackIcon />,
      color: '#4caf50',
      priority: 'medium',
      oidBranch: '1.3.6.1.4.1.61026.1.13',
      services: ['Submit Feedback', 'Track Feedback', 'View FAQs'],
      metrics: { users: 0, transactions: 0, satisfaction: 0 }
    }
  ];

const SudanGovPortal = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('dashboard');
  const [userRole, setUserRole] = useState('citizen'); // citizen, official, admin
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBiometricDialogOpen, setIsBiometricDialogOpen] = useState(false);
  const [biometricUsername, setBiometricUsername] = useState('');
  const [biometricMessage, setBiometricMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    services: 'active',
    oidSystem: 'connected',
    biometric: 'operational',
    blockchain: 'syncing'
  });
  const [governmentMetrics, setGovernmentMetrics] = useState({
    citizensRegistered: 12500000,
    servicesDigitalized: 847,
    transactionsToday: 156000,
    satisfactionScore: 4.7,
    systemUptime: 99.8
  });

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
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#6366f1';
      default: return '#64748b';
    }
  };

  const renderDepartmentCard = useCallback((department) => (
    <Card
      key={department.id}
      className="sudan-department-card"
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid transparent`,
        background: `linear-gradient(135deg, ${department.color}10 0%, ${department.color}05 100%)`,
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: department.color,
          boxShadow: `0 12px 40px ${department.color}30`
        }
      }}
      onClick={() => handleDepartmentChange(department.id)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${department.color} 0%, ${department.color}80 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem'
            }}
          >
            {department.icon}
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip
              label={department.priority}
              size="small"
              sx={{
                backgroundColor: `${getPriorityColor(department.priority)}20`,
                color: getPriorityColor(department.priority),
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.7rem'
              }}
            >
              {department.oidBranch}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 600,
            mb: 1,
            fontSize: '1.1rem',
            lineHeight: 1.3
          }}
        >
          {department.nameShort}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}
        >
          {department.services.slice(0, 3).join(' • ')}
        </Typography>

        {/* Department Metrics */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: department.color,
              borderRadius: 2
            }
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00e676'
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'متاح' : 'Online'}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
        <Card className="sudan-status-card">
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Analytics sx={{ fontSize: 48, color: '#0ea5e9', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700 }}>
              {(governmentMetrics.citizensRegistered / 1000000).toFixed(1)}M
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'مواطن مسجل' : 'Citizens Registered'}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(governmentMetrics.citizensRegistered / 45000000) * 100}
              sx={{ mt: 2, height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card">
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <CloudQueue sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700 }}>
              {governmentMetrics.servicesDigitalized}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'خدمة رقمية' : 'Digital Services'}
            </Typography>
            <Chip
              label={isRTL ? 'مكتمل 78%' : '78% Complete'}
              size="small"
              sx={{ mt: 1, backgroundColor: '#10b98120', color: '#10b981' }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card">
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <TrendingUp sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700 }}>
              {(governmentMetrics.transactionsToday / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'معاملة اليوم' : 'Transactions Today'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#00e676', mt: 1, display: 'block' }}>
              {isRTL ? '↗ +15% من الأمس' : '↗ +15% from yesterday'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card className="sudan-status-card">
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <MonitorHeart sx={{ fontSize: 48, color: '#6366f1', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 700 }}>
              {governmentMetrics.systemUptime.toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'وقت التشغيل' : 'System Uptime'}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00e676' }} />
              <Typography variant="caption" sx={{ color: '#00e676' }}>
                {isRTL ? 'صحي' : 'Healthy'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Grid */}
      <Grid item xs={12}>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 600,
            mb: 3,
            textAlign: 'center'
          }}
        >
          {isRTL ? 'الوزارات والإدارات الحكومية' : 'Government Ministries & Departments'}
        </Typography>
        
        <Grid container spacing={3}>
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
            <Typography
              variant="h6"
              sx={{ color: 'rgba(255, 255, 255, 0.95)', mb: 2, fontWeight: 600 }}
            >
              {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  className="sudan-action-btn"
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {isRTL ? 'تسجيل مواطن جديد' : 'Register New Citizen'}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Verified />}
                  className="sudan-action-btn"
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {isRTL ? 'التحقق من الهوية' : 'Verify Identity'}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Analytics />}
                  className="sudan-action-btn"
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {isRTL ? 'تقرير النظام' : 'System Report'}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Emergency />}
                  className="sudan-action-btn emergency"
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                >
                  {isRTL ? 'وضع الطوارئ' : 'Emergency Mode'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BiometricIcon />}
                  className="sudan-action-btn"
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={() => setIsBiometricDialogOpen(true)}
                >
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'var(--sudan-gradient-primary)' }}>
      {/* Navigation Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'var(--sudan-gradient-sidebar)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)'
          },
          display: { xs: 'none', md: 'block' }
        }}
      >
        {/* Logo and Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
            selected={selectedDepartment === 'dashboard'}
            onClick={() => handleDepartmentChange('dashboard')}
            className="sudan-nav-item"
          >
            <ListItemIcon>
              <Dashboard sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'لوحة المراقبة' : 'Dashboard'}
              sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
            />
          </ListItem>

          <ListItem
            button
            selected={selectedDepartment === 'oid_tree'}
            onClick={() => handleDepartmentChange('oid_tree')}
            className="sudan-nav-item"
          >
            <ListItemIcon>
              <AccountTree sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'شجرة المعرفات الذكية' : 'OID Tree'}
              sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
            />
          </ListItem>

          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {governmentDepartments.map((department) => (
            <ListItem
              key={department.id}
              button
              selected={selectedDepartment === department.id}
              onClick={() => handleDepartmentChange(department.id)}
              className="sudan-nav-item"
            >
              <ListItemIcon sx={{ color: department.color }}>
                {department.icon}
              </ListItemIcon>
              <ListItemText
                primary={isRTL ? department.nameShort.ar : department.nameShort}
                sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' } }}
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

          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <ListItem button className="sudan-nav-item">
            <ListItemIcon>
              <Settings sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'الإعدادات' : 'Settings'}
              sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
            />
          </ListItem>

          <ListItem button className="sudan-nav-item">
            <ListItemIcon>
              <Support sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </ListItemIcon>
            <ListItemText
              primary={isRTL ? 'الدعم الفني' : 'Support'}
              sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
            />
          </ListItem>
        </List>

        {/* System Status Footer */}
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 1 }}>
            {isRTL ? 'حالة النظام' : 'System Status'}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00e676' }} />
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
            width: 280,
            background: 'var(--sudan-gradient-sidebar)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {/* Same content as desktop sidebar */}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          background: 'var(--sudan-gradient-main)'
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'var(--sudan-gradient-appbar)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            {/* Mobile Menu Toggle */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& fieldset': { border: 'none' },
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                },
                '& input': { color: 'rgba(255, 255, 255, 0.9)' }
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'rgba(255, 255, 255, 0.6)', mr: 1 }} />
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
              <IconButton sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* System Status */}
              <IconButton sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <MonitorHeart />
              </IconButton>

              {/* User Profile */}
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontSize: '0.9rem'
                }}
              >
                {userRole === 'citizen' ? 'C' : userRole === 'official' ? 'A' : 'A'}
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
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: 600,
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  {governmentDepartments.find(d => d.id === selectedDepartment)?.name || 'Department'}
                </Typography>
                
                {renderSelectedDepartment(selectedDepartment)}
              </Box>
            )}
          </Container>
        </Suspense>

        <Fab 
          color="primary" 
          aria-label="chat" 
          onClick={toggleChat} 
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
              autoFocus
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
            <Button onClick={() => setIsBiometricDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleBiometricRegister}>{isRTL ? 'تسجيل' : 'Register'}</Button>
            <Button onClick={handleBiometricAuthenticate}>{isRTL ? 'مصادقة' : 'Authenticate'}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SudanGovPortal;
