import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  Psychology as AIIcon,
  Science as ObsidianIcon,
  Sync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  Timeline as TimelineIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  AccountBalance as FinanceIcon,
  Agriculture as AgricultureIcon,
  Business as GovernmentIcon,
  MonitorHeart as StatusIcon,
  CloudSync as CloudSyncIcon
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';
import { MINISTRY_OIDS, OID_ROOT } from '../config/oidConfig';

// TabPanel component for managing tabs
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OidTreeIntegration = ({ language = 'en', user, governmentData, onDataSync }) => {
  const { accessibility } = useAccessibility();
  const [activeTab, setActiveTab] = useState(0);
  const [integrationStatus, setIntegrationStatus] = useState({
    connected: false,
    syncing: false,
    lastSync: null,
    errors: [],
    warnings: []
  });
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    realTimeUpdates: true,
    biDirectionalSync: true,
    backupEnabled: true,
    syncFrequency: 300 // 5 minutes
  });
  const [mappedNodes, setMappedNodes] = useState(new Map());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = language === 'ar';

  // Sudan Government OID Structure mapped to existing BrainSAIT system
  const sudanOidMappings = useMemo(() => ({
    // Map Sudan's root to BrainSAIT Sudan branch
    [OID_ROOT]: {
      brainSaitId: '1.3.6.1.4.1.61026.1.1',
      name: isRTL ? 'جمهورية السودان - الحكومة الرقمية' : 'Republic of Sudan - Digital Government',
      type: 'government_root',
      status: 'active',
      services: ['identity', 'health', 'education', 'finance', 'agriculture'],
      aiCapabilities: ['citizen_analysis', 'service_optimization', 'arabic_processing']
    },
    // Identity and Civil Registry
    [MINISTRY_OIDS.identity]: {
      brainSaitId: '1.3.6.1.4.1.61026.1.1.1',
      name: isRTL ? 'الهوية المدنية والسجل المدني' : 'Citizen Identity & Civil Registry',
      type: 'identity_system',
      status: 'active',
      connections: 2500000,
      biometricEnabled: true,
      aiCapabilities: ['identity_verification', 'fraud_detection', 'document_validation']
    },
    // Health Ministry
    [MINISTRY_OIDS.health]: {
      brainSaitId: '1.3.6.1.4.1.61026.1.1.2',
      name: isRTL ? 'وزارة الصحة والسكان' : 'Ministry of Health & Population',
      type: 'healthcare_system',
      status: 'active',
      connections: 850000,
      aiCapabilities: ['patient_analysis', 'medical_records', 'health_predictions']
    },
    // Education Ministry
    [MINISTRY_OIDS.education]: {
      brainSaitId: '1.3.6.1.4.1.61026.1.2.1',
      name: isRTL ? 'وزارة التربية والتعليم' : 'Ministry of Education',
      type: 'education_system',
      status: 'active',
      connections: 8500000,
      aiCapabilities: ['student_analytics', 'educational_insights', 'certification_validation']
    },
    // Finance Ministry
    [MINISTRY_OIDS.finance]: {
      brainSaitId: '1.3.6.1.4.1.61026.1.2.2',
      name: isRTL ? 'وزارة المالية والتخطيط الاقتصادي' : 'Ministry of Finance & Economic Planning',
      type: 'finance_system',
      status: 'active',
      connections: 2500000,
      aiCapabilities: ['tax_analysis', 'economic_modeling', 'fraud_detection']
    },
    // Agriculture Ministry
    [MINISTRY_OIDS.agriculture]: {
      brainSaitId: '1.3.6.1.4.1.61026.2.1',
      name: isRTL ? 'وزارة الزراعة والثروة الحيوانية' : 'Ministry of Agriculture & Livestock',
      type: 'agriculture_system',
      status: 'active',
      connections: 2800000,
      aiCapabilities: ['crop_analysis', 'weather_prediction', 'farmer_insights']
    }
  }), [isRTL]);

  // Initialize integration status
  useEffect(() => {
    const initializeIntegration = async () => {
      try {
        setLoading(true);
        // Simulate connection to BrainSAIT OID system
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIntegrationStatus(prev => ({
          ...prev,
          connected: true,
          lastSync: new Date(),
          errors: [],
          warnings: []
        }));

        // Map Sudan OIDs to BrainSAIT structure
        const mappings = new Map();
        Object.entries(sudanOidMappings).forEach(([sudanOid, mapping]) => {
          mappings.set(sudanOid, {
            ...mapping,
            syncStatus: 'synced',
            lastUpdate: new Date(),
            performance: 85 + Math.random() * 15
          });
        });
        setMappedNodes(mappings);

      } catch (error) {
        console.error('Integration initialization failed:', error);
        setIntegrationStatus(prev => ({
          ...prev,
          connected: false,
          errors: [error.message]
        }));
      } finally {
        setLoading(false);
      }
    };

    initializeIntegration();
  }, [sudanOidMappings]);

  // Auto-sync functionality
  useEffect(() => {
    if (!syncSettings.autoSync || !integrationStatus.connected) return;

    const syncInterval = setInterval(async () => {
      try {
        setIntegrationStatus(prev => ({ ...prev, syncing: true }));
        
        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update sync status
        setIntegrationStatus(prev => ({
          ...prev,
          syncing: false,
          lastSync: new Date(),
          errors: []
        }));

        // Callback to parent component
        if (onDataSync) {
          onDataSync({
            timestamp: new Date(),
            nodes: Array.from(mappedNodes.keys()),
            status: 'success'
          });
        }

      } catch (error) {
        console.error('Auto-sync failed:', error);
        setIntegrationStatus(prev => ({
          ...prev,
          syncing: false,
          errors: [error.message]
        }));
      }
    }, syncSettings.syncFrequency * 1000);

    return () => clearInterval(syncInterval);
  }, [syncSettings.autoSync, syncSettings.syncFrequency, integrationStatus.connected, mappedNodes, onDataSync]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleManualSync = async () => {
    try {
      setIntegrationStatus(prev => ({ ...prev, syncing: true }));
      
      // Simulate manual sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationStatus(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date(),
        errors: []
      }));

      setSnackbarMessage(isRTL ? 'تمت المزامنة بنجاح' : 'Sync completed successfully');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Manual sync failed:', error);
      setIntegrationStatus(prev => ({
        ...prev,
        syncing: false,
        errors: [error.message]
      }));
      setSnackbarMessage(isRTL ? 'فشلت المزامنة' : 'Sync failed');
      setSnackbarOpen(true);
    }
  };

  const getServiceIcon = (type) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (type) {
      case 'identity_system': return <SecurityIcon {...iconProps} />;
      case 'healthcare_system': return <HealthIcon {...iconProps} />;
      case 'education_system': return <EducationIcon {...iconProps} />;
      case 'finance_system': return <FinanceIcon {...iconProps} />;
      case 'agriculture_system': return <AgricultureIcon {...iconProps} />;
      case 'government_root': return <GovernmentIcon {...iconProps} />;
      default: return <TreeIcon {...iconProps} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00e676';
      case 'syncing': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'warning': return '#fbbf24';
      default: return '#9e9e9e';
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert 
          severity={integrationStatus.connected ? 'success' : 'error'}
          icon={integrationStatus.connected ? <SuccessIcon /> : <ErrorIcon />}
          sx={{ mb: 3 }}
        >
          {integrationStatus.connected 
            ? (isRTL ? 'متصل بنجاح بنظام BrainSAIT OID' : 'Successfully connected to BrainSAIT OID System')
            : (isRTL ? 'غير متصل بنظام BrainSAIT OID' : 'Not connected to BrainSAIT OID System')
          }
        </Alert>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <TreeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {isRTL ? 'العقد المتصلة' : 'Connected Nodes'}
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {mappedNodes.size}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {isRTL ? 'العقد النشطة في النظام' : 'Active nodes in system'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <SyncIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {isRTL ? 'حالة المزامنة' : 'Sync Status'}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {integrationStatus.syncing ? (isRTL ? 'جاري...' : 'Active') : (isRTL ? 'مكتمل' : 'Complete')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {integrationStatus.lastSync 
                ? `${isRTL ? 'آخر مزامنة:' : 'Last sync:'} ${integrationStatus.lastSync.toLocaleTimeString()}`
                : (isRTL ? 'لم تتم المزامنة بعد' : 'No sync performed yet')
              }
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <StatusIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {isRTL ? 'أداء النظام' : 'System Performance'}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {Math.round(Array.from(mappedNodes.values()).reduce((acc, node) => acc + node.performance, 0) / mappedNodes.size || 0)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {isRTL ? 'متوسط أداء العقد' : 'Average node performance'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'خريطة تكامل الخدمات' : 'Service Integration Map'}
            </Typography>
            <Grid container spacing={2}>
              {Array.from(mappedNodes.entries()).map(([sudanOid, mapping]) => (
                <Grid item xs={12} md={6} key={sudanOid}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        {getServiceIcon(mapping.type)}
                        <Box ml={2}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {mapping.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sudan: {sudanOid} → BrainSAIT: {mapping.brainSaitId}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={mapping.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(mapping.status)}20`,
                            color: getStatusColor(mapping.status),
                            border: `1px solid ${getStatusColor(mapping.status)}`
                          }}
                        />
                        <Typography variant="body2">
                          {mapping.connections?.toLocaleString()} {isRTL ? 'اتصال' : 'connections'}
                        </Typography>
                      </Box>
                      {mapping.performance && (
                        <Box mt={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="caption">
                              {isRTL ? 'الأداء' : 'Performance'}
                            </Typography>
                            <Typography variant="caption">
                              {Math.round(mapping.performance)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={mapping.performance}
                            sx={{ borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إعدادات المزامنة' : 'Sync Settings'}
            </Typography>
            <List>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncSettings.autoSync}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                    />
                  }
                  label={isRTL ? 'المزامنة التلقائية' : 'Auto Sync'}
                />
              </ListItem>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncSettings.realTimeUpdates}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, realTimeUpdates: e.target.checked }))}
                    />
                  }
                  label={isRTL ? 'التحديثات الفورية' : 'Real-time Updates'}
                />
              </ListItem>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncSettings.biDirectionalSync}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, biDirectionalSync: e.target.checked }))}
                    />
                  }
                  label={isRTL ? 'المزامنة ثنائية الاتجاه' : 'Bi-directional Sync'}
                />
              </ListItem>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncSettings.backupEnabled}
                      onChange={(e) => setSyncSettings(prev => ({ ...prev, backupEnabled: e.target.checked }))}
                    />
                  }
                  label={isRTL ? 'النسخ الاحتياطي' : 'Backup Enabled'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'تفاصيل الاتصال' : 'Connection Details'}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TreeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'نظام BrainSAIT OID' : 'BrainSAIT OID System'}
                  secondary={isRTL ? 'مُتصل ونشط' : 'Connected and Active'}
                />
                <Chip 
                  label={isRTL ? 'متصل' : 'Connected'}
                  color="success" 
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AIIcon />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'الذكاء الاصطناعي المتقدم' : 'AI Enhancement'}
                  secondary={isRTL ? 'التحليل الذكي مُفعل' : 'Intelligent analysis enabled'}
                />
                <Chip 
                  label={isRTL ? 'مُفعل' : 'Enabled'}
                  color="primary" 
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ObsidianIcon />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'مزامنة Obsidian' : 'Obsidian Sync'}
                  secondary={isRTL ? 'إدارة المعرفة المتقدمة' : 'Advanced knowledge management'}
                />
                <Chip 
                  label={isRTL ? 'متاح' : 'Available'}
                  color="secondary" 
                  size="small"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إعدادات متقدمة' : 'Advanced Settings'}
            </Typography>
            
            {Object.entries(sudanOidMappings).map(([sudanOid, mapping]) => (
              <Accordion key={sudanOid}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    {getServiceIcon(mapping.type)}
                    <Typography sx={{ ml: 2 }}>{mapping.name}</Typography>
                    <Box flexGrow={1} />
                    <Chip 
                      label={mapping.status}
                      size="small"
                      color={mapping.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isRTL ? 'معرف السودان:' : 'Sudan OID:'} {sudanOid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isRTL ? 'معرف BrainSAIT:' : 'BrainSAIT OID:'} {mapping.brainSaitId}
                  </Typography>
                  
                  {mapping.aiCapabilities && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        {isRTL ? 'قدرات الذكاء الاصطناعي:' : 'AI Capabilities:'}
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {mapping.aiCapabilities.map((capability, index) => (
                          <Chip
                            key={index}
                            label={capability}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        setSelectedMapping({ sudanOid, ...mapping });
                        setDialogOpen(true);
                      }}
                    >
                      {isRTL ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      variant="outlined"
                    >
                      {isRTL ? 'تحرير' : 'Edit'}
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderStatus = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'حالة النظام في الوقت الفعلي' : 'Real-time System Status'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center" p={2}>
                  <Badge 
                    badgeContent={integrationStatus.connected ? '✓' : '✗'}
                    color={integrationStatus.connected ? 'success' : 'error'}
                  >
                    <NetworkIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  </Badge>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {isRTL ? 'الاتصال' : 'Connection'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {integrationStatus.connected 
                      ? (isRTL ? 'متصل' : 'Connected') 
                      : (isRTL ? 'منقطع' : 'Disconnected')
                    }
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign="center" p={2}>
                  {integrationStatus.syncing ? (
                    <CircularProgress size={48} />
                  ) : (
                    <CloudSyncIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  )}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {isRTL ? 'المزامنة' : 'Sync'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {integrationStatus.syncing 
                      ? (isRTL ? 'جاري المزامنة...' : 'Syncing...') 
                      : (isRTL ? 'مكتمل' : 'Complete')
                    }
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign="center" p={2}>
                  <AIIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {isRTL ? 'الذكاء الاصطناعي' : 'AI Processing'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRTL ? 'نشط' : 'Active'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box textAlign="center" p={2}>
                  <ObsidianIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {isRTL ? 'قاعدة المعرفة' : 'Knowledge Base'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isRTL ? 'متاح' : 'Available'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                {isRTL ? 'سجل النشاط' : 'Activity Log'}
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleManualSync}
                disabled={integrationStatus.syncing}
                variant="outlined"
              >
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </Box>

            <List>
              <ListItem>
                <ListItemIcon>
                  <SuccessIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'تم تأسيس الاتصال' : 'Connection established'}
                  secondary={isRTL ? 'منذ دقيقتين' : '2 minutes ago'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SyncIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'اكتملت مزامنة البيانات' : 'Data sync completed'}
                  secondary={isRTL ? 'منذ 5 دقائق' : '5 minutes ago'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AIIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary={isRTL ? 'تم تفعيل التحليل الذكي' : 'AI analysis enabled'}
                  secondary={isRTL ? 'منذ 10 دقائق' : '10 minutes ago'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <TreeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{
                    fontSize: accessibility.fontSize === 'large' ? '2.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  {isRTL ? 'تكامل نظام BrainSAIT OID' : 'BrainSAIT OID System Integration'}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {isRTL ? 'دمج البوابة الحكومية السودانية' : 'Sudan Government Portal Integration'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={2}>
              {loading && <CircularProgress size={24} />}
              <Button
                variant="contained"
                startIcon={<SyncIcon />}
                onClick={handleManualSync}
                disabled={integrationStatus.syncing || loading}
                sx={{ minHeight: '44px' }}
              >
                {integrationStatus.syncing 
                  ? (isRTL ? 'جاري المزامنة...' : 'Syncing...') 
                  : (isRTL ? 'مزامنة يدوية' : 'Manual Sync')
                }
              </Button>
            </Box>
          </Box>

          {/* Status indicators */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={integrationStatus.connected ? <SuccessIcon /> : <ErrorIcon />}
              label={integrationStatus.connected 
                ? (isRTL ? 'متصل' : 'Connected') 
                : (isRTL ? 'منقطع' : 'Disconnected')
              }
              color={integrationStatus.connected ? 'success' : 'error'}
              size="small"
            />
            <Chip
              icon={<TimelineIcon />}
              label={`${mappedNodes.size} ${isRTL ? 'خدمة مدمجة' : 'Services Integrated'}`}
              color="primary"
              size="small"
            />
            {integrationStatus.lastSync && (
              <Chip
                label={`${isRTL ? 'آخر مزامنة:' : 'Last sync:'} ${integrationStatus.lastSync.toLocaleTimeString()}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={isRTL ? 'نظرة عامة' : 'Overview'} 
            icon={<TreeIcon />}
          />
          <Tab 
            label={isRTL ? 'الإعدادات' : 'Configuration'} 
            icon={<SettingsIcon />}
          />
          <Tab 
            label={isRTL ? 'الحالة' : 'Status'} 
            icon={<StatusIcon />}
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {renderOverview()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderConfiguration()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderStatus()}
      </TabPanel>

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMapping && (
          <>
            <DialogTitle>
              {selectedMapping.name} - {isRTL ? 'تفاصيل التكامل' : 'Integration Details'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {isRTL ? 'معرف السودان:' : 'Sudan OID:'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    {selectedMapping.sudanOid}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {isRTL ? 'معرف BrainSAIT:' : 'BrainSAIT OID:'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    {selectedMapping.brainSaitId}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {isRTL ? 'النوع:' : 'Type:'}
                  </Typography>
                  <Chip label={selectedMapping.type} size="small" sx={{ mb: 2 }} />
                </Grid>
                {selectedMapping.aiCapabilities && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      {isRTL ? 'قدرات الذكاء الاصطناعي:' : 'AI Capabilities:'}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedMapping.aiCapabilities.map((capability, index) => (
                        <Chip
                          key={index}
                          label={capability}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button variant="contained">
                {isRTL ? 'تحرير التكامل' : 'Edit Integration'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OidTreeIntegration;
