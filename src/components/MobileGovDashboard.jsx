import {
  Dashboard,
  Person,
  LocalHospital,
  School,
  AccountBalance,
  Agriculture,
  Menu,
  Close,
  Search,
  Notifications,
  QrCodeScanner,
  Fingerprint,
  MoreVert,
  Verified,
  Emergency,
  Support,
  Settings,
  Language,
  ArrowBack,
  SwipeUp,
  TouchApp,
  PhoneAndroid,
  Wifi,
  SignalCellular4Bar,
  Battery90,
  LocationOn
} from '@mui/icons-material';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Badge,
  Chip,
  LinearProgress,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme
} from '@mui/material';

import { useState, useEffect, forwardRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MobileGovDashboard = ({ isRTL = false, userRole = 'citizen' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [citizenData, setCitizenData] = useState({
    name: isRTL ? 'محمد أحمد الطيب' : 'Mohammed Ahmed Al-Tayeb',
    id: 'SD-01-001-123456789',
    verificationLevel: 'Level 3',
    activeServices: 8,
    pendingTasks: 3
  });

  // Mobile-optimized government services
  const mobileServices = [
    {
      id: 'identity',
      name: isRTL ? 'الهوية الرقمية' : 'Digital ID',
      icon: <Person />,
      color: '#0ea5e9',
      urgent: false,
      notifications: 0,
      lastUsed: '2 hours ago'
    },
    {
      id: 'health',
      name: isRTL ? 'الخدمات الصحية' : 'Health Services',
      icon: <LocalHospital />,
      color: '#10b981',
      urgent: false,
      notifications: 2,
      lastUsed: '1 day ago'
    },
    {
      id: 'education',
      name: isRTL ? 'التعليم' : 'Education',
      icon: <School />,
      color: '#6366f1',
      urgent: false,
      notifications: 0,
      lastUsed: '3 days ago'
    },
    {
      id: 'finance',
      name: isRTL ? 'الخدمات المالية' : 'Financial Services',
      icon: <AccountBalance />,
      color: '#f59e0b',
      urgent: true,
      notifications: 1,
      lastUsed: '5 hours ago'
    },
    {
      id: 'agriculture',
      name: isRTL ? 'الزراعة' : 'Agriculture',
      icon: <Agriculture />,
      color: '#22c55e',
      urgent: false,
      notifications: 0,
      lastUsed: '1 week ago'
    },
    {
      id: 'emergency',
      name: isRTL ? 'الطوارئ' : 'Emergency',
      icon: <Emergency />,
      color: '#ef4444',
      urgent: false,
      notifications: 0,
      lastUsed: 'Never'
    }
  ];

  const quickActions = [
    {
      icon: <QrCodeScanner />,
      name: isRTL ? 'مسح الرمز' : 'Scan QR',
      action: () => handleQuickAction('qr_scan')
    },
    {
      icon: <Fingerprint />,
      name: isRTL ? 'التحقق الحيوي' : 'Biometric',
      action: () => handleQuickAction('biometric')
    },
    {
      icon: <Verified />,
      name: isRTL ? 'التحقق السريع' : 'Quick Verify',
      action: () => handleQuickAction('quick_verify')
    },
    {
      icon: <Support />,
      name: isRTL ? 'الدعم الفني' : 'Support',
      action: () => handleQuickAction('support')
    }
  ];

  const notifications = [
    {
      id: 1,
      title: isRTL ? 'طلب معاش تم الموافقة عليه' : 'Pension Request Approved',
      message: isRTL ? 'تم الموافقة على طلب المعاش الخاص بك' : 'Your pension request has been approved',
      type: 'success',
      time: '2h ago',
      urgent: false
    },
    {
      id: 2,
      title: isRTL ? 'موعد طبي قريب' : 'Upcoming Medical Appointment',
      message: isRTL ? 'لديك موعد طبي غداً في الساعة 10 صباحاً' : 'You have a medical appointment tomorrow at 10 AM',
      type: 'info',
      time: '4h ago',
      urgent: true
    },
    {
      id: 3,
      title: isRTL ? 'تحديث النظام' : 'System Update',
      message: isRTL ? 'سيتم إجراء صيانة للنظام الليلة' : 'System maintenance scheduled for tonight',
      type: 'warning',
      time: '1d ago',
      urgent: false
    }
  ];

  const handleQuickAction = (action) => {
    setQuickActionOpen(false);
    // Handle specific quick actions
    console.log(`Quick action: ${action}`);
  };

  const renderServiceCard = (service) => (
    <Card
      key={service.id}
      className="mobile-service-card"
      onClick={() => setSelectedService(service)}
      sx={{
        minHeight: 120,
        background: `linear-gradient(135deg, ${service.color}15 0%, ${service.color}08 100%)`,
        border: `1px solid ${service.color}30`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        '&:active': {
          transform: 'scale(0.98)',
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            {service.icon}
          </Box>
          
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
            {service.urgent && (
              <Chip
                label={isRTL ? 'عاجل' : 'Urgent'}
                size="small"
                sx={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
            )}
            {service.notifications > 0 && (
              <Badge
                badgeContent={service.notifications}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    minWidth: 16,
                    height: 16
                  }
                }}
              >
                <Notifications sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              </Badge>
            )}
          </Box>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 600,
            fontSize: '0.9rem',
            mb: 0.5
          }}
        >
          {service.name}
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.7rem'
          }}
        >
          {isRTL ? 'آخر استخدام:' : 'Last used:'} {service.lastUsed}
        </Typography>
      </CardContent>
      
      {/* Touch indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: service.color,
          opacity: 0.6
        }}
      />
    </Card>
  );

  const renderMobileHeader = () => (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Toolbar sx={{ px: 2, minHeight: '56px !important' }}>
        {/* Status Bar Indicators */}
        <Box display="flex" alignItems="center" gap={0.5} mr={1}>
          <SignalCellular4Bar sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
          <Wifi sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
          <Battery90 sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
        </Box>
        
        {/* User Info */}
        <Box display="flex" alignItems="center" flex={1} gap={2}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              fontSize: '0.8rem'
            }}
          >
            {citizenData.name.charAt(0)}
          </Avatar>
          
          <Box flex={1}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: 600,
                fontSize: '0.85rem',
                lineHeight: 1.2
              }}
            >
              {citizenData.name.split(' ').slice(0, 2).join(' ')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.7rem'
              }}
            >
              {citizenData.id}
            </Typography>
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <IconButton
          size="small"
          onClick={() => setSearchOpen(true)}
          sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 1 }}
        >
          <Search />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={() => setNotificationOpen(true)}
          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
        >
          <Badge badgeContent={citizenData.pendingTasks} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  const renderStatusBar = () => (
    <Paper
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        p: 2,
        mb: 2
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography
          variant="body1"
          sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, fontSize: '0.9rem' }}
        >
          {isRTL ? 'حالة الخدمات' : 'Service Status'}
        </Typography>
        
        <Chip
          label={isRTL ? 'كلها تعمل' : 'All Online'}
          size="small"
          sx={{
            backgroundColor: 'rgba(0, 230, 118, 0.2)',
            color: '#00e676',
            fontSize: '0.7rem'
          }}
        />
      </Box>
      
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Box textAlign="center">
            <Typography
              variant="h6"
              sx={{ color: '#0ea5e9', fontWeight: 700, fontSize: '1.2rem' }}
            >
              {citizenData.activeServices}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}
            >
              {isRTL ? 'خدمة متاحة' : 'Active Services'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box textAlign="center">
            <Typography
              variant="h6"
              sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.2rem' }}
            >
              {citizenData.pendingTasks}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}
            >
              {isRTL ? 'مهام معلقة' : 'Pending Tasks'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <LinearProgress
        variant="determinate"
        value={85}
        sx={{
          mt: 2,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#00e676',
            borderRadius: 3
          }
        }}
      />
      
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem', mt: 1, display: 'block' }}
      >
        {isRTL ? 'مستوى إكمال الملف الشخصي: 85%' : 'Profile Completion: 85%'}
      </Typography>
    </Paper>
  );

  const renderQuickActions = () => (
    <Box mb={3}>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 600, fontSize: '0.9rem' }}
      >
        {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
      </Typography>
      
      <Grid container spacing={1.5}>
        {quickActions.slice(0, 4).map((action, index) => (
          <Grid item xs={6} key={index}>
            <Button
              fullWidth
              variant="outlined"
              onClick={action.action}
              sx={{
                py: 2,
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                '&:active': { transform: 'scale(0.98)' },
                '&:hover': {
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  borderColor: 'rgba(14, 165, 233, 0.4)'
                }
              }}
            >
              <Box sx={{ color: '#0ea5e9', fontSize: '1.5rem' }}>
                {action.icon}
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.7rem', textAlign: 'center' }}
              >
                {action.name}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        pb: 8 // Space for bottom navigation
      }}
    >
      {/* Mobile Header */}
      {renderMobileHeader()}
      
      {/* Main Content */}
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Status Overview */}
        {renderStatusBar()}
        
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Services Grid */}
        <Typography
          variant="body1"
          sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 600, fontSize: '0.9rem' }}
        >
          {isRTL ? 'الخدمات الحكومية' : 'Government Services'}
        </Typography>
        
        <Grid container spacing={1.5}>
          {mobileServices.map((service) => (
            <Grid item xs={6} key={service.id}>
              {renderServiceCard(service)}
            </Grid>
          ))}
        </Grid>
        
        {/* Recent Activity */}
        <Box mt={3}>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 600, fontSize: '0.9rem' }}
          >
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </Typography>
          
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Verified sx={{ fontSize: 20, color: '#00e676' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'تم التحقق من الهوية' : 'Identity Verified'}
                    secondary={isRTL ? 'منذ ساعتين' : '2 hours ago'}
                    sx={{
                      '& .MuiTypography-root': { fontSize: '0.8rem' },
                      '& .MuiTypography-body2': { fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocalHospital sx={{ fontSize: 20, color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'حجز موعد طبي' : 'Medical Appointment Booked'}
                    secondary={isRTL ? 'منذ يوم واحد' : '1 day ago'}
                    sx={{
                      '& .MuiTypography-root': { fontSize: '0.8rem' },
                      '& .MuiTypography-body2': { fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccountBalance sx={{ fontSize: 20, color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'دفع الضرائب' : 'Tax Payment'}
                    secondary={isRTL ? 'منذ 3 أيام' : '3 days ago'}
                    sx={{
                      '& .MuiTypography-root': { fontSize: '0.8rem' },
                      '& .MuiTypography-body2': { fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Container>
      
      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        elevation={8}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={(event, newValue) => setBottomNavValue(newValue)}
          showLabels
          sx={{
            backgroundColor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.7rem',
              '&.Mui-selected': {
                color: '#0ea5e9'
              }
            }
          }}
        >
          <BottomNavigationAction
            label={isRTL ? 'الرئيسية' : 'Home'}
            icon={<Dashboard />}
          />
          <BottomNavigationAction
            label={isRTL ? 'الخدمات' : 'Services'}
            icon={<TouchApp />}
          />
          <BottomNavigationAction
            label={isRTL ? 'الملف' : 'Profile'}
            icon={<Person />}
          />
          <BottomNavigationAction
            label={isRTL ? 'المزيد' : 'More'}
            icon={<MoreVert />}
          />
        </BottomNavigation>
      </Paper>
      
      {/* Floating Quick Action Button */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1100,
          '& .MuiFab-primary': {
            background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
            width: 48,
            height: 48
          }
        }}
        icon={<SpeedDialIcon />}
        open={quickActionOpen}
        onOpen={() => setQuickActionOpen(true)}
        onClose={() => setQuickActionOpen(false)}
        direction="up"
      >
        {quickActions.slice(0, 3).map((action, index) => (
          <SpeedDialAction
            key={index}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            sx={{
              '& .MuiFab-primary': {
                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                color: '#0ea5e9',
                width: 40,
                height: 40
              }
            }}
          />
        ))}
      </SpeedDial>
      
      {/* Search Dialog */}
      <Dialog
        fullScreen
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        TransitionComponent={Transition}
        sx={{
          '& .MuiDialog-paper': {
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <AppBar elevation={0} sx={{ backgroundColor: 'transparent' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setSearchOpen(false)}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
              {isRTL ? 'البحث في الخدمات' : 'Search Services'}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container sx={{ mt: 8, px: 2 }}>
          <TextField
            fullWidth
            autoFocus
            placeholder={isRTL ? 'ابحث عن الخدمات الحكومية...' : 'Search government services...'}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& fieldset': { border: 'none' }
              },
              '& input': { color: 'white', fontSize: '1.1rem' }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              )
            }}
          />
        </Container>
      </Dialog>
      
      {/* Notification Panel */}
      <SwipeableDrawer
        anchor="top"
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onOpen={() => setNotificationOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '50vh'
          }
        }}
      >
        <Box sx={{ p: 3, pt: 1 }}>
          {/* Handle */}
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
              mx: 'auto',
              mb: 2
            }}
          />
          
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255, 255, 255, 0.95)', mb: 2, fontSize: '1rem', fontWeight: 600 }}
          >
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </Typography>
          
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                  sx={{
                    '& .MuiTypography-root': { fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)' },
                    '& .MuiTypography-body2': { fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', ml: 1 }}
                >
                  {notification.time}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default MobileGovDashboard;