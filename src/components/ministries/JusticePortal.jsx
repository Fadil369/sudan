import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  TabPanel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Gavel as JusticeIcon,
  ExpandMore as ExpandMoreIcon,
  Balance as BalanceIcon,
  Description as DocumentIcon,
  AccountBalance as CourtIcon,
  Security as SecurityIcon,
  Person as LawyerIcon,
  Assessment as ReportsIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  PendingActions as PendingIcon,
  Warning as WarningIcon,
  FolderOpen as CaseIcon,
  Handshake as MediationIcon,
  School as TrainingIcon,
  Verified as VerifiedIcon,
  Shield as LegalAidIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const JusticePortal = ({ citizenData }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseSearch, setCaseSearch] = useState('');
  const [justiceData, setJusticeData] = useState({
    totalCases: 12543,
    pendingCases: 3421,
    resolvedCases: 8456,
    activeLawyers: 1234,
    courtsOperational: 89,
    totalJudges: 567
  });
  const [applications, setApplications] = useState([]);
  const [showNewApplication, setShowNewApplication] = useState(false);

  const sudanStates = [
    { value: 'khartoum', label: 'الخرطوم / Khartoum' },
    { value: 'blue_nile', label: 'النيل الأزرق / Blue Nile' },
    { value: 'white_nile', label: 'النيل الأبيض / White Nile' },
    { value: 'kassala', label: 'كسلا / Kassala' },
    { value: 'red_sea', label: 'البحر الأحمر / Red Sea' },
    { value: 'northern', label: 'الشمالية / Northern' },
    { value: 'river_nile', label: 'نهر النيل / River Nile' },
    { value: 'north_kordofan', label: 'شمال كردفان / North Kordofan' },
    { value: 'south_kordofan', label: 'جنوب كردفان / South Kordofan' },
    { value: 'north_darfur', label: 'شمال دارفور / North Darfur' },
    { value: 'south_darfur', label: 'جنوب دارفور / South Darfur' },
    { value: 'west_darfur', label: 'غرب دارفور / West Darfur' },
    { value: 'east_darfur', label: 'شرق دارفور / East Darfur' },
    { value: 'central_darfur', label: 'وسط دارفور / Central Darfur' },
    { value: 'west_kordofan', label: 'غرب كردفان / West Kordofan' },
    { value: 'sennar', label: 'سنار / Sennar' },
    { value: 'al_qadarif', label: 'القضارف / Al Qadarif' },
    { value: 'al_jazirah', label: 'الجزيرة / Al Jazirah' }
  ];

  const legalServices = [
    { 
      type: 'civil', 
      name: 'القضايا المدنية / Civil Cases', 
      icon: <BalanceIcon />, 
      cases: 4521, 
      color: 'primary' 
    },
    { 
      type: 'criminal', 
      name: 'القضايا الجنائية / Criminal Cases', 
      icon: <SecurityIcon />, 
      cases: 3214, 
      color: 'error' 
    },
    { 
      type: 'commercial', 
      name: 'القضايا التجارية / Commercial Cases', 
      icon: <CourtIcon />, 
      cases: 2156, 
      color: 'success' 
    },
    { 
      type: 'family', 
      name: 'قضايا الأحوال الشخصية / Family Law', 
      icon: <Person />, 
      cases: 1876, 
      color: 'info' 
    },
    { 
      type: 'administrative', 
      name: 'القضايا الإدارية / Administrative Cases', 
      icon: <DocumentIcon />, 
      cases: 776, 
      color: 'warning' 
    }
  ];

  const recentCases = [
    {
      id: 'C2024001',
      title: 'نزاع عقاري - الخرطوم / Property Dispute - Khartoum',
      type: 'civil',
      status: 'pending',
      court: 'محكمة الخرطوم المدنية / Khartoum Civil Court',
      nextHearing: '2024-01-15',
      priority: 'high'
    },
    {
      id: 'C2024002',
      title: 'قضية تجارية - بورتسودان / Commercial Case - Port Sudan',
      type: 'commercial',
      status: 'in_session',
      court: 'محكمة البحر الأحمر التجارية / Red Sea Commercial Court',
      nextHearing: '2024-01-12',
      priority: 'medium'
    },
    {
      id: 'C2024003',
      title: 'قضية أحوال شخصية - الجزيرة / Family Law - Al Jazirah',
      type: 'family',
      status: 'resolved',
      court: 'محكمة الأحوال الشخصية / Family Court',
      resolvedDate: '2024-01-08',
      priority: 'low'
    }
  ];

  const legalAidPrograms = [
    {
      name: 'المساعدة القانونية للمواطنين / Legal Aid for Citizens',
      description: 'خدمات قانونية مجانية للمواطنين ذوي الدخل المحدود',
      beneficiaries: 2341,
      status: 'active'
    },
    {
      name: 'برنامج الوساطة المجتمعية / Community Mediation Program',
      description: 'حل النزاعات خارج المحاكم عبر الوساطة',
      beneficiaries: 1876,
      status: 'active'
    },
    {
      name: 'التدريب القانوني للمحامين / Legal Training for Lawyers',
      description: 'برامج تطوير مهارات المحامين والقضاة',
      beneficiaries: 456,
      status: 'active'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`justice-tabpanel-${index}`}
      aria-labelledby={`justice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_session': return 'primary';
      case 'pending': return 'warning';
      case 'delayed': return 'error';
      case 'appealed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CompleteIcon />;
      case 'in_session': return <ScheduleIcon />;
      case 'pending': return <PendingIcon />;
      case 'delayed': return <WarningIcon />;
      case 'appealed': return <CaseIcon />;
      default: return <PendingIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Statistics */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إحصائيات العدالة' : 'Justice Statistics'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <CaseIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {justiceData.totalCases.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'إجمالي القضايا' : 'Total Cases'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <PendingIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {justiceData.pendingCases.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'قضايا معلقة' : 'Pending Cases'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <CompleteIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {justiceData.resolvedCases.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'قضايا محلولة' : 'Resolved Cases'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* System Status */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'حالة النظام' : 'System Status'}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CourtIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${justiceData.courtsOperational} ${isRTL ? 'محكمة فعّالة' : 'Active Courts'}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <JusticeIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${justiceData.totalJudges} ${isRTL ? 'قاضي' : 'Judges'}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LawyerIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary={`${justiceData.activeLawyers} ${isRTL ? 'محامي مرخص' : 'Licensed Lawyers'}`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Case Types Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'أنواع القضايا' : 'Case Types'}
            </Typography>
            <Grid container spacing={2}>
              {legalServices.map((service) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={service.type}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 }
                    }}
                    onClick={() => setActiveTab(1)}
                  >
                    <Box color={`${service.color}.main`} sx={{ mb: 2 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {service.name}
                    </Typography>
                    <Typography variant="h6" color={`${service.color}.main`}>
                      {service.cases.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'قضية' : 'cases'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Cases */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'القضايا الحديثة' : 'Recent Cases'}
            </Typography>
            {recentCases.map((case_) => (
              <Box key={case_.id} mb={2} p={2} border="1px solid" borderColor="divider" borderRadius={2}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {case_.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {case_.court}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={case_.priority}
                      color={getPriorityColor(case_.priority)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={getStatusIcon(case_.status)}
                      label={case_.status}
                      color={getStatusColor(case_.status)}
                      size="small"
                    />
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {isRTL ? 'رقم القضية' : 'Case No'}: {case_.id}
                </Typography>
                {case_.nextHearing && (
                  <Typography variant="body2" color="info.main">
                    {isRTL ? 'الجلسة القادمة' : 'Next Hearing'}: {new Date(case_.nextHearing).toLocaleDateString()}
                  </Typography>
                )}
                {case_.resolvedDate && (
                  <Typography variant="body2" color="success.main">
                    {isRTL ? 'تاريخ الحل' : 'Resolved on'}: {new Date(case_.resolvedDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderServices = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {isRTL ? 'الخدمات القانونية' : 'Legal Services'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setShowNewApplication(true)}
        >
          {isRTL ? 'طلب جديد' : 'New Application'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'تسجيل قضية جديدة' : 'Register New Case'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'تسجيل القضايا المدنية والجنائية والتجارية' :
                  'Register civil, criminal, and commercial cases'
                }
              </Typography>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'ابدأ الآن' : 'Start Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'طلب استشارة قانونية' : 'Legal Consultation Request'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'احصل على استشارة قانونية من محامين مختصين' :
                  'Get legal consultation from specialized lawyers'
                }
              </Typography>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'احجز موعد' : 'Book Appointment'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'ترخيص محامي' : 'Lawyer License'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'التقدم للحصول على ترخيص مزاولة المحاماة' :
                  'Apply for lawyer practice license'
                }
              </Typography>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'تقدم الآن' : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'توثيق المستندات' : 'Document Authentication'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'توثيق وتصديق المستندات القانونية' :
                  'Authenticate and notarize legal documents'
                }
              </Typography>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'ابدأ التوثيق' : 'Start Authentication'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          {isRTL ? 'برامج المساعدة القانونية' : 'Legal Aid Programs'}
        </Typography>
        <Grid container spacing={2}>
          {legalAidPrograms.map((program, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LegalAidIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {program.name.split(' / ')[isRTL ? 0 : 1] || program.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {program.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {program.beneficiaries.toLocaleString()} {isRTL ? 'مستفيد' : 'beneficiaries'}
                    </Typography>
                    <Chip 
                      label={program.status} 
                      color="success" 
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  const renderCaseSearch = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'البحث في القضايا' : 'Case Search'}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label={isRTL ? 'رقم القضية أو اسم المدعي' : 'Case Number or Plaintiff Name'}
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<SearchIcon />}
            >
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isRTL ? 'رقم القضية' : 'Case No.'}</TableCell>
              <TableCell>{isRTL ? 'العنوان' : 'Title'}</TableCell>
              <TableCell>{isRTL ? 'النوع' : 'Type'}</TableCell>
              <TableCell>{isRTL ? 'الحالة' : 'Status'}</TableCell>
              <TableCell>{isRTL ? 'المحكمة' : 'Court'}</TableCell>
              <TableCell>{isRTL ? 'التاريخ' : 'Date'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentCases.map((case_) => (
              <TableRow key={case_.id} hover>
                <TableCell>{case_.id}</TableCell>
                <TableCell>{case_.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={legalServices.find(s => s.type === case_.type)?.name.split(' / ')[isRTL ? 0 : 1] || case_.type}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(case_.status)}
                    label={case_.status}
                    color={getStatusColor(case_.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{case_.court.split(' / ')[isRTL ? 0 : 1] || case_.court}</TableCell>
                <TableCell>
                  {case_.nextHearing 
                    ? new Date(case_.nextHearing).toLocaleDateString()
                    : case_.resolvedDate 
                      ? new Date(case_.resolvedDate).toLocaleDateString()
                      : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <JusticeIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h4" component="h1">
            {isRTL ? 'وزارة العدل' : 'Ministry of Justice'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isRTL ? 'البوابة الرقمية للخدمات القضائية' : 'Digital Justice Services Portal'}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={isRTL ? 'لوحة القيادة' : 'Dashboard'} />
          <Tab label={isRTL ? 'الخدمات' : 'Services'} />
          <Tab label={isRTL ? 'البحث في القضايا' : 'Case Search'} />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {renderDashboard()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderServices()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderCaseSearch()}
      </TabPanel>

      {/* New Application Dialog */}
      <Dialog open={showNewApplication} onClose={() => setShowNewApplication(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isRTL ? 'طلب خدمة قانونية جديد' : 'New Legal Service Application'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'نوع الخدمة' : 'Service Type'}
                select
                defaultValue=""
              >
                <MenuItem value="case_registration">
                  {isRTL ? 'تسجيل قضية' : 'Case Registration'}
                </MenuItem>
                <MenuItem value="legal_consultation">
                  {isRTL ? 'استشارة قانونية' : 'Legal Consultation'}
                </MenuItem>
                <MenuItem value="document_auth">
                  {isRTL ? 'توثيق مستندات' : 'Document Authentication'}
                </MenuItem>
                <MenuItem value="lawyer_license">
                  {isRTL ? 'ترخيص محامي' : 'Lawyer License'}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'المحكمة المختصة' : 'Relevant Court'}
                select
                defaultValue=""
              >
                <MenuItem value="civil">
                  {isRTL ? 'محكمة مدنية' : 'Civil Court'}
                </MenuItem>
                <MenuItem value="criminal">
                  {isRTL ? 'محكمة جنائية' : 'Criminal Court'}
                </MenuItem>
                <MenuItem value="commercial">
                  {isRTL ? 'محكمة تجارية' : 'Commercial Court'}
                </MenuItem>
                <MenuItem value="family">
                  {isRTL ? 'محكمة أحوال شخصية' : 'Family Court'}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isRTL ? 'موضوع الطلب' : 'Application Subject'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isRTL ? 'تفاصيل الطلب' : 'Application Details'}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch />}
                label={isRTL ? 'طلب المساعدة القانونية المجانية' : 'Request Free Legal Aid'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إرسال الطلب' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JusticePortal;