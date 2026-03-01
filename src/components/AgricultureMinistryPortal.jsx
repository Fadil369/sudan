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
  Avatar,
  Divider,
} from '@mui/material';
import {
  Agriculture,
  Terrain,
  WaterDrop,
  WbSunny,
  LocalFlorist,
  TrendingUp,
  AttachMoney,
  Description,
  Science,
  Grass,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function AgricultureMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const agriStats = {
    registeredFarms: 1,
    activeLands: 250,
    subsidiesReceived: 15000,
    weatherAlerts: 2,
  };

  const myFarms = [
    {
      id: 'FARM-2026-001',
      name: 'Al-Gezira Farm #234',
      location: 'Wad Madani, Al-Gezira',
      area: 250,
      crops: ['Wheat', 'Cotton', 'Sorghum'],
      status: 'Active',
      registered: '2020-03-15',
      color: '#16a34a',
    },
  ];

  const marketPrices = [
    {
      crop: 'Wheat',
      price: 450,
      change: +12,
      trend: 'up',
      unit: 'SDG/kg',
      color: '#16a34a',
    },
    {
      crop: 'Cotton',
      price: 320,
      change: -5,
      trend: 'down',
      unit: 'SDG/kg',
      color: '#dc2626',
    },
    {
      crop: 'Sorghum',
      price: 380,
      change: +8,
      trend: 'up',
      unit: 'SDG/kg',
      color: '#16a34a',
    },
  ];

  const weatherForecast = [
    {
      day: 'Today',
      temp: '32°C',
      condition: 'Sunny',
      rain: '0%',
      icon: <WbSunny />,
      color: '#eab308',
    },
    {
      day: 'Tomorrow',
      temp: '34°C',
      condition: 'Partly Cloudy',
      rain: '10%',
      icon: <WbSunny />,
      color: '#2563eb',
    },
    {
      day: 'Wed',
      temp: '30°C',
      condition: 'Rain Expected',
      rain: '75%',
      icon: <WaterDrop />,
      color: '#0891b2',
    },
  ];

  const services = [
    {
      title: isRTL ? 'تسجيل المزارع' : 'Farm Registration',
      description: isRTL
        ? 'تسجيل أراضيك الزراعية رسمياً'
        : 'Officially register your agricultural land',
      icon: Terrain,
      color: '#65a30d',
      featured: true,
      stats: [
        { value: agriStats.registeredFarms, label: isRTL ? 'مزرعة' : 'Farms' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض المزارع' : 'View Farms',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'الإعانات الزراعية' : 'Agricultural Subsidies',
      description: isRTL
        ? 'التقدم للحصول على دعم زراعي'
        : 'Apply for farming support grants',
      icon: AttachMoney,
      color: '#16a34a',
      featured: true,
      stats: [
        { value: `${agriStats.subsidiesReceived} SDG`, label: isRTL ? 'مستلم' : 'Received' },
      ],
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'توقعات الطقس' : 'Weather Forecast',
      description: isRTL
        ? 'توقعات طقس زراعية مفصلة'
        : 'Detailed agricultural weather forecasts',
      icon: WbSunny,
      color: '#eab308',
      badge: `${agriStats.weatherAlerts} ${isRTL ? 'تنبيه' : 'Alerts'}`,
      actions: [
        {
          label: isRTL ? 'عرض التوقعات' : 'View Forecast',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'أسعار السوق' : 'Market Prices',
      description: isRTL
        ? 'أسعار المحاصيل الحية'
        : 'Live crop market prices',
      icon: TrendingUp,
      color: '#2563eb',
      actions: [
        {
          label: isRTL ? 'عرض الأسعار' : 'View Prices',
          onClick: () => setCurrentTab(3),
        },
      ],
    },
    {
      title: isRTL ? 'الاستشارات الزراعية' : 'Agricultural Consulting',
      description: isRTL
        ? 'خدمات إرشادية من الخبراء'
        : 'Expert advisory services',
      icon: Science,
      color: '#7c3aed',
      actions: [
        {
          label: isRTL ? 'احجز استشارة' : 'Book Consultation',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'إدارة المحاصيل' : 'Crop Management',
      description: isRTL
        ? 'تتبع وإدارة محاصيلك'
        : 'Track and manage your crops',
      icon: Grass,
      color: '#16a34a',
      actions: [
        {
          label: isRTL ? 'إدارة' : 'Manage',
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
          background: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Agriculture sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة الزراعة' : 'Agriculture Ministry'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'الخدمات الزراعية الرقمية' : 'Digital Farming Services'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.9"
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
                  title={isRTL ? 'مزارع مسجلة' : 'Farms'}
                  value={agriStats.registeredFarms}
                  icon={Terrain}
                  color="#65a30d"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الأراضي' : 'Land Area'}
                  value={agriStats.activeLands}
                  subtitle={isRTL ? 'هكتار' : 'hectares'}
                  icon={LocalFlorist}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الإعانات' : 'Subsidies'}
                  value={agriStats.subsidiesReceived}
                  subtitle="SDG"
                  icon={AttachMoney}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تنبيهات الطقس' : 'Weather'}
                  value={agriStats.weatherAlerts}
                  subtitle={isRTL ? 'تنبيه' : 'Alerts'}
                  icon={WbSunny}
                  color="#eab308"
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
            startIcon={<Terrain />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'مزارعي' : 'My Farms'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<WbSunny />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'الطقس' : 'Weather'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<TrendingUp />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'الأسعار' : 'Prices'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<AttachMoney />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'الإعانات' : 'Subsidies'}
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
          <Tab label={isRTL ? 'مزارعي' : 'My Farms'} />
          <Tab label={isRTL ? 'الطقس' : 'Weather'} />
          <Tab label={isRTL ? 'أسعار السوق' : 'Market Prices'} />
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

          {/* My Farms Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'المزارع المسجلة' : 'Registered Farms'}
                </Typography>
                <Button variant="outlined" startIcon={<Terrain />}>
                  {isRTL ? 'تسجيل مزرعة' : 'Register Farm'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {myFarms.map((farm, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${farm.color}30`,
                        '&:hover': {
                          borderColor: farm.color,
                          boxShadow: `0 4px 12px ${farm.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {farm.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {farm.location} • ID: {farm.id}
                          </Typography>
                          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                            <Chip label={farm.status} size="small" color="success" />
                            <Chip label={`${farm.area} ${isRTL ? 'هكتار' : 'hectares'}`} size="small" variant="outlined" />
                            {farm.crops.map((crop, i) => (
                              <Chip
                                key={i}
                                label={crop}
                                size="small"
                                sx={{
                                  bgcolor: `${farm.color}15`,
                                  color: farm.color,
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Button variant="contained" sx={{ ml: 2 }}>
                          {isRTL ? 'إدارة' : 'Manage'}
                        </Button>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary">
                        {isRTL ? 'مسجلة منذ' : 'Registered since'}: {farm.registered}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Weather Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'التوقعات الزراعية' : 'Agricultural Forecast'}
              </Typography>

              <Grid container spacing={3}>
                {weatherForecast.map((day, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${day.color}20`,
                        textAlign: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: `${day.color}15`,
                          color: day.color,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        {day.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                        {day.day}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: day.color }} gutterBottom>
                        {day.temp}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {day.condition}
                      </Typography>
                      <Chip
                        icon={<WaterDrop />}
                        label={`${isRTL ? 'احتمال المطر' : 'Rain'}: ${day.rain}`}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: `${day.color}15`,
                          color: day.color,
                          fontWeight: 600,
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Market Prices Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'أسعار السوق الحية' : 'Live Market Prices'}
              </Typography>

              <Grid container spacing={3}>
                {marketPrices.map((item, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${item.color}20`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.crop}
                        </Typography>
                        <Chip
                          label={item.trend === 'up' ? '▲' : '▼'}
                          size="small"
                          sx={{
                            bgcolor: `${item.color}15`,
                            color: item.color,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: item.color }} gutterBottom>
                        {item.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.unit}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: item.trend === 'up' ? '#16a34a' : '#dc2626',
                          fontWeight: 600,
                        }}
                      >
                        {item.change > 0 ? '+' : ''}{item.change}% {isRTL ? 'هذا الأسبوع' : 'this week'}
                      </Typography>
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
