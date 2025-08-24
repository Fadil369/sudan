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
} from '@mui/material';
import {
  Engineering as InfrastructureIcon,
  ExpandMore as ExpandMoreIcon,
  Construction as ConstructionIcon,
  DirectionsSubway as TransportIcon,
  Wifi as TelecomIcon,
  Plumbing as WaterIcon,
  ElectricalServices as ElectricalIcon,
  Assessment as ReportsIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Build as BuildIcon,
  Traffic as TrafficIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Warning as WarningIcon,
  Map as MapIcon,
  MonitorHeart as MonitorIcon,
  Handyman as MaintenanceIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const InfrastructurePortal = ({ citizenData }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [infrastructureData, setInfrastructureData] = useState({
    totalProjects: 145,
    completedProjects: 89,
    ongoingProjects: 45,
    plannedProjects: 11,
    totalBudget: 2.5,
    utilizationRate: 78
  });
  const [projectApplications, setProjectApplications] = useState([]);
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

  const infrastructureTypes = [
    { type: 'transport', name: 'النقل / Transportation', icon: <TransportIcon />, projects: 35, color: 'primary' },
    { type: 'telecom', name: 'الاتصالات / Telecommunications', icon: <TelecomIcon />, projects: 28, color: 'secondary' },
    { type: 'water', name: 'المياه والصرف / Water & Sanitation', icon: <WaterIcon />, projects: 32, color: 'info' },
    { type: 'electrical', name: 'البنية الكهربائية / Electrical Grid', icon: <ElectricalIcon />, projects: 25, color: 'warning' },
    { type: 'construction', name: 'البناء والتشييد / Construction', icon: <ConstructionIcon />, projects: 18, color: 'success' },
    { type: 'public', name: 'المرافق العامة / Public Facilities', icon: <SchoolIcon />, projects: 15, color: 'error' }
  ];

  const ongoingProjects = [
    {
      id: 1,
      name: 'مطار الخرطوم الجديد / New Khartoum Airport',
      type: 'transport',
      state: 'khartoum',
      progress: 75,
      budget: 850,
      status: 'ongoing',
      startDate: '2022-03-15',
      expectedCompletion: '2024-12-30'
    },
    {
      id: 2,
      name: 'شبكة الألياف البصرية الوطنية / National Fiber Optic Network',
      type: 'telecom',
      state: 'multiple',
      progress: 45,
      budget: 320,
      status: 'ongoing',
      startDate: '2023-01-10',
      expectedCompletion: '2025-06-15'
    },
    {
      id: 3,
      name: 'مشروع المياه الكبير - دارفور / Greater Darfur Water Project',
      type: 'water',
      state: 'north_darfur',
      progress: 60,
      budget: 450,
      status: 'ongoing',
      startDate: '2022-09-01',
      expectedCompletion: '2024-08-30'
    },
    {
      id: 4,
      name: 'طريق كسلا - القضارف السريع / Kassala-Qadarif Highway',
      type: 'transport',
      state: 'kassala',
      progress: 30,
      budget: 280,
      status: 'ongoing',
      startDate: '2023-06-01',
      expectedCompletion: '2025-12-31'
    }
  ];

  const completedProjects = [
    {
      id: 5,
      name: 'جسر النيل الأزرق / Blue Nile Bridge',
      type: 'transport',
      state: 'blue_nile',
      progress: 100,
      budget: 65,
      status: 'completed',
      completedDate: '2023-09-15'
    },
    {
      id: 6,
      name: 'مستشفى الخرطوم التخصصي / Khartoum Specialist Hospital',
      type: 'public',
      state: 'khartoum',
      progress: 100,
      budget: 120,
      status: 'completed',
      completedDate: '2023-07-20'
    }
  ];

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`infrastructure-tabpanel-${index}`}
      aria-labelledby={`infrastructure-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'primary';
      case 'planned': return 'info';
      case 'delayed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'ongoing': return <PendingIcon />;
      case 'planned': return <ScheduleIcon />;
      case 'delayed': return <WarningIcon />;
      default: return <PendingIcon />;
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Statistics */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إحصائيات البنية التحتية' : 'Infrastructure Statistics'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <BuildIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {infrastructureData.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'إجمالي المشاريع' : 'Total Projects'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <CompleteIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {infrastructureData.completedProjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'مكتملة' : 'Completed'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <PendingIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {infrastructureData.ongoingProjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'قيد التنفيذ' : 'Ongoing'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <MonitorIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    ${infrastructureData.totalBudget}B
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'إجمالي الميزانية' : 'Total Budget'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Budget Utilization */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'استخدام الميزانية' : 'Budget Utilization'}
            </Typography>
            <Box textAlign="center" py={3}>
              <Typography variant="h3" color="primary">
                {infrastructureData.utilizationRate}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={infrastructureData.utilizationRate} 
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {isRTL ? 'من إجمالي الميزانية المخصصة' : 'of allocated budget'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Infrastructure Types */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'أنواع البنية التحتية' : 'Infrastructure Types'}
            </Typography>
            <Grid container spacing={2}>
              {infrastructureTypes.map((type) => (
                <Grid item xs={12} sm={6} md={4} key={type.type}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 }
                    }}
                    onClick={() => setActiveTab(1)}
                  >
                    <Box color={`${type.color}.main`} sx={{ mb: 2 }}>
                      {type.icon}
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {type.name}
                    </Typography>
                    <Typography variant="h6" color={`${type.color}.main`}>
                      {type.projects}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'مشروع' : 'projects'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProjects = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {isRTL ? 'المشاريع الحالية' : 'Current Projects'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setShowNewApplication(true)}
        >
          {isRTL ? 'اقتراح مشروع' : 'Propose Project'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {ongoingProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip 
                        label={infrastructureTypes.find(t => t.type === project.type)?.name || project.type}
                        size="small"
                        color={infrastructureTypes.find(t => t.type === project.type)?.color || 'default'}
                      />
                      <Chip 
                        label={sudanStates.find(s => s.value === project.state)?.label || project.state}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Chip
                    icon={getStatusIcon(project.status)}
                    label={project.status}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {isRTL ? 'التقدم' : 'Progress'}: {project.progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'الميزانية' : 'Budget'}
                    </Typography>
                    <Typography variant="subtitle2">
                      ${project.budget}M
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'الإكمال المتوقع' : 'Expected Completion'}
                    </Typography>
                    <Typography variant="subtitle2">
                      {new Date(project.expectedCompletion).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => setSelectedProject(project)}
                >
                  {isRTL ? 'عرض التفاصيل' : 'View Details'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        {isRTL ? 'المشاريع المكتملة' : 'Completed Projects'}
      </Typography>
      
      <Grid container spacing={3}>
        {completedProjects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip 
                        label={infrastructureTypes.find(t => t.type === project.type)?.name || project.type}
                        size="small"
                        color={infrastructureTypes.find(t => t.type === project.type)?.color || 'default'}
                      />
                      <Chip 
                        label={sudanStates.find(s => s.value === project.state)?.label || project.state}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Chip
                    icon={<CompleteIcon />}
                    label={isRTL ? 'مكتمل' : 'Completed'}
                    color="success"
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'الميزانية' : 'Budget'}
                    </Typography>
                    <Typography variant="subtitle2">
                      ${project.budget}M
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'تاريخ الإكمال' : 'Completion Date'}
                    </Typography>
                    <Typography variant="subtitle2">
                      {new Date(project.completedDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics'}
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isRTL ? 'الولاية' : 'State'}</TableCell>
              <TableCell align="right">{isRTL ? 'المشاريع النشطة' : 'Active Projects'}</TableCell>
              <TableCell align="right">{isRTL ? 'الميزانية المخصصة' : 'Allocated Budget (M$)'}</TableCell>
              <TableCell align="right">{isRTL ? 'معدل الإكمال' : 'Completion Rate'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sudanStates.slice(0, 10).map((state, index) => (
              <TableRow key={state.value}>
                <TableCell>{state.label}</TableCell>
                <TableCell align="right">{Math.floor(Math.random() * 10) + 2}</TableCell>
                <TableCell align="right">${Math.floor(Math.random() * 200) + 50}</TableCell>
                <TableCell align="right">{Math.floor(Math.random() * 40) + 60}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" gap={2} flexWrap="wrap">
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          {isRTL ? 'تحميل تقرير المشاريع' : 'Download Projects Report'}
        </Button>
        <Button variant="outlined" startIcon={<TimelineIcon />}>
          {isRTL ? 'عرض التحليلات' : 'View Analytics'}
        </Button>
        <Button variant="outlined" startIcon={<MapIcon />}>
          {isRTL ? 'الخريطة التفاعلية' : 'Interactive Map'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <InfrastructureIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h4" component="h1">
            {isRTL ? 'وزارة البنية التحتية' : 'Ministry of Infrastructure'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isRTL ? 'البوابة الرقمية لمشاريع البنية التحتية' : 'Digital Infrastructure Projects Portal'}
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
          <Tab label={isRTL ? 'المشاريع' : 'Projects'} />
          <Tab label={isRTL ? 'التقارير' : 'Reports'} />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {renderDashboard()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderProjects()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderReports()}
      </TabPanel>

      {/* New Project Proposal Dialog */}
      <Dialog open={showNewApplication} onClose={() => setShowNewApplication(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isRTL ? 'اقتراح مشروع جديد' : 'New Project Proposal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'نوع المشروع' : 'Project Type'}
                select
                defaultValue=""
              >
                {infrastructureTypes.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'الولاية' : 'State'}
                select
                defaultValue=""
              >
                {sudanStates.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isRTL ? 'اسم المشروع' : 'Project Name'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isRTL ? 'وصف المشروع' : 'Project Description'}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'الميزانية المقدرة (مليون دولار)' : 'Estimated Budget (Million $)'}
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isRTL ? 'المدة المتوقعة (شهور)' : 'Expected Duration (Months)'}
                type="number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إرسال الاقتراح' : 'Submit Proposal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'التقدم' : 'Progress'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.progress} 
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="body2">
                      {selectedProject.progress}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'الحالة' : 'Status'}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedProject.status)}
                    label={selectedProject.status}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'الميزانية' : 'Budget'}
                  </Typography>
                  <Typography variant="h6">
                    ${selectedProject.budget}M
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'تاريخ البداية' : 'Start Date'}
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedProject.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProject(null)}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfrastructurePortal;