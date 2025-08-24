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
} from '@mui/material';
import {
  FlashOn as EnergyIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Battery20 as BatteryIcon,
  WbSunny as SolarIcon,
  Air as WindIcon,
  WaterDrop as HydroIcon,
  LocalGasStation as OilIcon,
  ElectricBolt as PowerIcon,
  Assessment as ReportsIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Lightbulb as LightbulbIcon,
  Factory as FactoryIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const EnergyPortal = ({ citizenData }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('khartoum');
  const [energyData, setEnergyData] = useState({
    consumption: 0,
    production: 0,
    renewablePercent: 0,
    gridStatus: 'stable'
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

  const energySources = [
    { type: 'hydro', name: 'الطاقة المائية / Hydro', percentage: 45, icon: <HydroIcon /> },
    { type: 'thermal', name: 'الطاقة الحرارية / Thermal', percentage: 35, icon: <FactoryIcon /> },
    { type: 'solar', name: 'الطاقة الشمسية / Solar', percentage: 15, icon: <SolarIcon /> },
    { type: 'wind', name: 'طاقة الرياح / Wind', percentage: 5, icon: <WindIcon /> }
  ];

  const consumerTypes = [
    { type: 'residential', name: 'سكني / Residential', consumption: 60, icon: <HomeIcon /> },
    { type: 'industrial', name: 'صناعي / Industrial', consumption: 25, icon: <FactoryIcon /> },
    { type: 'commercial', name: 'تجاري / Commercial', consumption: 15, icon: <BusinessIcon /> }
  ];

  useEffect(() => {
    // Simulate real-time energy data updates
    const interval = setInterval(() => {
      setEnergyData(prev => ({
        ...prev,
        consumption: Math.floor(Math.random() * 100) + 850,
        production: Math.floor(Math.random() * 50) + 900,
        renewablePercent: Math.floor(Math.random() * 10) + 60,
        gridStatus: Math.random() > 0.1 ? 'stable' : 'maintenance'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`energy-tabpanel-${index}`}
      aria-labelledby={`energy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const handleNewApplication = () => {
    setShowNewApplication(true);
  };

  const renderEnergyDashboard = () => (
    <Grid container spacing={3}>
      {/* Real-time Energy Statistics */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إحصائيات الطاقة المباشرة' : 'Real-time Energy Statistics'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <PowerIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {energyData.production}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'ميجاواط - الإنتاج' : 'MW - Production'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <LightbulbIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {energyData.consumption}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'ميجاواط - الاستهلاك' : 'MW - Consumption'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <SolarIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {energyData.renewablePercent}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {isRTL ? 'طاقة متجددة' : 'Renewable Energy'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                {isRTL ? 'حالة الشبكة' : 'Grid Status'}
              </Typography>
              <Chip
                label={energyData.gridStatus === 'stable' 
                  ? (isRTL ? 'مستقرة' : 'Stable')
                  : (isRTL ? 'صيانة' : 'Maintenance')
                }
                color={energyData.gridStatus === 'stable' ? 'success' : 'warning'}
                variant="filled"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Energy Sources Breakdown */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'مصادر الطاقة' : 'Energy Sources'}
            </Typography>
            {energySources.map((source) => (
              <Box key={source.type} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {source.icon}
                  <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
                    {source.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {source.percentage}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={source.percentage} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Regional Energy Map */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'خريطة الطاقة الإقليمية' : 'Regional Energy Map'}
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{isRTL ? 'اختر الولاية' : 'Select State'}</InputLabel>
              <Select
                value={selectedRegion}
                label={isRTL ? 'اختر الولاية' : 'Select State'}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {sudanStates.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Grid container spacing={2}>
              {consumerTypes.map((consumer) => (
                <Grid item xs={12} sm={4} key={consumer.type}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    {consumer.icon}
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      {consumer.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {consumer.consumption}%
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

  const renderApplications = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {isRTL ? 'طلبات الخدمات' : 'Service Applications'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleNewApplication}
        >
          {isRTL ? 'طلب جديد' : 'New Application'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'طلب توصيل كهرباء جديد' : 'New Electricity Connection'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'تقدم بطلب لتوصيل الكهرباء للمنازل والمؤسسات الجديدة' :
                  'Apply for electricity connection for new homes and establishments'
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
                {isRTL ? 'تصريح الطاقة المتجددة' : 'Renewable Energy Permit'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'احصل على تصريح لتركيب أنظمة الطاقة الشمسية وطاقة الرياح' :
                  'Get permits for installing solar panels and wind energy systems'
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
                {isRTL ? 'ترخيص مزود طاقة' : 'Energy Provider License'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'احصل على ترخيص لتوزيع الطاقة الكهربائية' :
                  'Obtain license for electricity distribution services'
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
                {isRTL ? 'شكوى انقطاع الكهرباء' : 'Power Outage Complaint'}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {isRTL ? 
                  'أبلغ عن انقطاع الكهرباء في منطقتك' :
                  'Report power outages in your area'
                }
              </Typography>
              <Button variant="outlined" fullWidth>
                {isRTL ? 'أبلغ الآن' : 'Report Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isRTL ? 'الولاية' : 'State'}</TableCell>
              <TableCell align="right">{isRTL ? 'الإنتاج (ميجاواط)' : 'Production (MW)'}</TableCell>
              <TableCell align="right">{isRTL ? 'الاستهلاك (ميجاواط)' : 'Consumption (MW)'}</TableCell>
              <TableCell align="right">{isRTL ? 'الطاقة المتجددة %' : 'Renewable %'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sudanStates.slice(0, 8).map((state, index) => (
              <TableRow key={state.value}>
                <TableCell>{state.label}</TableCell>
                <TableCell align="right">{Math.floor(Math.random() * 100) + 50}</TableCell>
                <TableCell align="right">{Math.floor(Math.random() * 80) + 40}</TableCell>
                <TableCell align="right">{Math.floor(Math.random() * 30) + 20}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
        >
          {isRTL ? 'تحميل التقرير الشهري' : 'Download Monthly Report'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<TimelineIcon />}
        >
          {isRTL ? 'عرض الاتجاهات' : 'View Trends'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <EnergyIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h4" component="h1">
            {isRTL ? 'وزارة الطاقة' : 'Ministry of Energy'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isRTL ? 'البوابة الرقمية لخدمات الطاقة' : 'Digital Energy Services Portal'}
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
          <Tab label={isRTL ? 'الطلبات' : 'Applications'} />
          <Tab label={isRTL ? 'التقارير' : 'Reports'} />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {renderEnergyDashboard()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderApplications()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderReports()}
      </TabPanel>

      {/* New Application Dialog */}
      <Dialog open={showNewApplication} onClose={() => setShowNewApplication(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isRTL ? 'طلب خدمة جديد' : 'New Service Application'}
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
                <MenuItem value="connection">
                  {isRTL ? 'توصيل كهرباء' : 'Electricity Connection'}
                </MenuItem>
                <MenuItem value="renewable">
                  {isRTL ? 'طاقة متجددة' : 'Renewable Energy'}
                </MenuItem>
                <MenuItem value="license">
                  {isRTL ? 'ترخيص' : 'License'}
                </MenuItem>
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
                label={isRTL ? 'وصف الطلب' : 'Application Description'}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => setShowNewApplication(false)}>
            {isRTL ? 'إرسال' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnergyPortal;