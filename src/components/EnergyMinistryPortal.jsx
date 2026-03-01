import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ElectricBolt,
  WaterDrop,
  LocalGasStation,
  WbSunny,
  Bolt,
  AttachMoney,
  ReportProblem,
  Download,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function EnergyMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const energyStats = {
    monthlyUsage: 340,
    currentBill: 1850,
    outageReports: 0,
    solarInstalled: 'No',
  };

  const utilityBills = [
    {
      month: 'February 2026',
      electricity: 1450,
      water: 400,
      total: 1850,
      dueDate: '2026-03-10',
      status: 'Unpaid',
      usage: { electricity: 340, water: 85 },
      color: '#ea580c',
    },
    {
      month: 'January 2026',
      electricity: 1320,
      water: 380,
      total: 1700,
      paidDate: '2026-02-08',
      status: 'Paid',
      usage: { electricity: 310, water: 82 },
      color: '#16a34a',
    },
  ];

  const meterReadings = [
    {
      type: 'Electricity',
      meterId: 'ELEC-123456',
      lastReading: 4567,
      currentReading: 4907,
      consumption: 340,
      unit: 'kWh',
      icon: <ElectricBolt />,
      color: '#eab308',
    },
    {
      type: 'Water',
      meterId: 'WATER-654321',
      lastReading: 2345,
      currentReading: 2430,
      consumption: 85,
      unit: 'm³',
      icon: <WaterDrop />,
      color: '#0891b2',
    },
  ];

  const services = [
    {
      title: isRTL ? 'دفع الفواتير' : 'Bill Payment',
      description: isRTL
        ? 'دفع فواتير الكهرباء والمياه'
        : 'Pay electricity and water bills online',
      icon: AttachMoney,
      color: '#eab308',
      featured: true,
      stats: [
        { value: `${energyStats.currentBill} SDG`, label: isRTL ? 'مستحق' : 'Due' },
      ],
      actions: [
        {
          label: isRTL ? 'دفع الآن' : 'Pay Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'قراءات العدادات' : 'Meter Readings',
      description: isRTL
        ? 'عرض وتقديم قراءات العدادات'
        : 'View and submit meter readings',
      icon: Bolt,
      color: '#2563eb',
      featured: true,
      stats: [
        { value: `${energyStats.monthlyUsage} kWh`, label: isRTL ? 'هذا الشهر' : 'This Month' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض القراءات' : 'View Readings',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'الإبلاغ عن انقطاع' : 'Report Outage',
      description: isRTL
        ? 'الإبلاغ عن انقطاع الكهرباء أو الماء'
        : 'Report electricity or water outage',
      icon: ReportProblem,
      color: '#dc2626',
      badge: isRTL ? 'متاح 24/7' : 'Available 24/7',
      actions: [
        {
          label: isRTL ? 'إبلاغ الآن' : 'Report Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الطاقة الشمسية' : 'Solar Energy',
      description: isRTL
        ? 'التقدم لبرنامج الطاقة الشمسية المنزلية'
        : 'Apply for residential solar program',
      icon: WbSunny,
      color: '#f59e0b',
      actions: [
        {
          label: isRTL ? 'معرفة المزيد' : 'Learn More',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'كفاءة الطاقة' : 'Energy Efficiency',
      description: isRTL
        ? 'نصائح وبرامج توفير الطاقة'
        : 'Energy saving tips and programs',
      icon: CheckCircle,
      color: '#16a34a',
      actions: [
        {
          label: isRTL ? 'عرض النصائح' : 'View Tips',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'جدول الصيانة' : 'Maintenance Schedule',
      description: isRTL
        ? 'صيانة مجدولة وانقطاعات متوقعة'
        : 'Scheduled maintenance and planned outages',
      icon: Schedule,
      color: '#7c3aed',
      actions: [
        {
          label: isRTL ? 'عرض الجدول' : 'View Schedule',
          onClick: () => {},
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
          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <ElectricBolt sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة الطاقة' : 'Energy Ministry'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'خدمات الكهرباء والمياه' : 'Power & Water Services'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.10"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الاستهلاك' : 'Usage'}
                  value={energyStats.monthlyUsage}
                  subtitle="kWh"
                  icon={Bolt}
                  color="#eab308"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الفاتورة الحالية' : 'Current Bill'}
                  value={energyStats.currentBill}
                  subtitle="SDG"
                  icon={AttachMoney}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'انقطاعات' : 'Outages'}
                  value={energyStats.outageReports}
                  icon={ReportProblem}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'طاقة شمسية' : 'Solar'}
                  value={energyStats.solarInstalled}
                  icon={WbSunny}
                  color="#f59e0b"
                  variant="gradient"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<AttachMoney />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'دفع الفاتورة' : 'Pay Bill'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Bolt />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'قراءة العداد' : 'Meter Reading'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<ReportProblem />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'إبلاغ عن انقطاع' : 'Report Outage'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
            {isRTL ? 'الفواتير' : 'Bills'}
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
          <Tab label={isRTL ? 'قراءات العدادات' : 'Meter Readings'} />
          <Tab label={isRTL ? 'الطاقة الشمسية' : 'Solar Energy'} />
          <Tab label={isRTL ? 'الفواتير' : 'Bills'} />
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

          {/* Meter Readings Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'قراءات العدادات الحالية' : 'Current Meter Readings'}
              </Typography>

              <Grid container spacing={3}>
                {meterReadings.map((meter, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${meter.color}20`,
                        '&:hover': {
                          borderColor: meter.color,
                          boxShadow: `0 4px 12px ${meter.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${meter.color}15`,
                            color: meter.color,
                          }}
                        >
                          {meter.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {meter.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {meter.meterId}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'القراءة السابقة' : 'Last Reading'}
                            secondary={`${meter.lastReading.toLocaleString()} ${meter.unit}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'القراءة الحالية' : 'Current Reading'}
                            secondary={`${meter.currentReading.toLocaleString()} ${meter.unit}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الاستهلاك' : 'Consumption'}
                            secondary={
                              <Typography variant="h6" sx={{ fontWeight: 800, color: meter.color }}>
                                {meter.consumption} {meter.unit}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </List>

                      <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                        {isRTL ? 'تقديم قراءة جديدة' : 'Submit New Reading'}
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Solar Energy Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                {isRTL ? 'برنامج الطاقة الشمسية المنزلية' : 'Residential Solar Program'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {isRTL
                  ? 'قم بتركيب الألواح الشمسية وقلل من فواتير الكهرباء. احصل على دعم حكومي يصل إلى 50٪ من تكاليف التركيب.'
                  : 'Install solar panels and reduce your electricity bills. Get up to 50% government subsidy on installation costs.'}
              </Typography>

              <Card sx={{ p: 3, borderRadius: 3, border: '2px solid #f59e0b20', mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b' }} gutterBottom>
                  {isRTL ? 'الفوائد' : 'Benefits'}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary={isRTL ? '• دعم حكومي 50٪' : '• 50% Government Subsidy'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={isRTL ? '• تخفيض فواتير الكهرباء حتى 70٪' : '• Reduce bills up to 70%'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={isRTL ? '• صيانة مجانية لمدة 5 سنوات' : '• Free maintenance for 5 years'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={isRTL ? '• ضمان 20 سنة على الألواح' : '• 20-year panel warranty'} />
                  </ListItem>
                </List>
                <Button variant="contained" sx={{ bgcolor: '#f59e0b', mt: 2 }} fullWidth>
                  {isRTL ? 'تقديم طلب' : 'Apply Now'}
                </Button>
              </Card>
            </Box>
          )}

          {/* Bills Tab */}
          {currentTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'الفواتير الحالية والسابقة' : 'Current & Past Bills'}
                </Typography>
                <Button variant="outlined" startIcon={<Download />}>
                  {isRTL ? 'تنزيل الكل' : 'Download All'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {utilityBills.map((bill, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${bill.color}30`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {bill.month}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              label={bill.status}
                              size="small"
                              color={bill.status === 'Paid' ? 'success' : 'warning'}
                              sx={{ fontWeight: 600 }}
                            />
                            {bill.dueDate && (
                              <Chip
                                label={`${isRTL ? 'تاريخ الاستحقاق' : 'Due'}: ${bill.dueDate}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: bill.color }}>
                          {bill.total.toLocaleString()} SDG
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'الكهرباء' : 'Electricity'}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {bill.electricity} SDG
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bill.usage.electricity} kWh
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'الماء' : 'Water'}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {bill.water} SDG
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bill.usage.water} m³
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          {bill.status === 'Unpaid' ? (
                            <Button variant="contained" fullWidth sx={{ bgcolor: bill.color }}>
                              {isRTL ? 'دفع الآن' : 'Pay Now'}
                            </Button>
                          ) : (
                            <Button variant="outlined" fullWidth startIcon={<Download />}>
                              {isRTL ? 'تنزيل' : 'Download'}
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
