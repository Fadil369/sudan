import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Bolt as EnergyIcon,
  Power as PowerIcon,
  Assessment as AnalyticsIcon
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

function TabPanel({ children, value, index, ...other }) {
  return (
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
}

const EnergyMinistryPortal = ({ language = 'en', user }) => {
  const { accessibility } = useAccessibility();
  const [activeTab, setActiveTab] = useState(0);
  const [energyData, setEnergyData] = useState(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/energy');
        const data = await response.json();
        setEnergyData(data);
      } catch (error) {
        console.error('Error fetching energy data:', error);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            textAlign: isRTL ? 'right' : 'left',
            fontSize: accessibility.fontSize === 'large' ? '2.5rem' : '2rem'
          }}
        >
          {isRTL ? 'نظرة عامة على قطاع الطاقة' : 'Energy Sector Overview'}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PowerIcon sx={{ fontSize: 40, color: '#1e88e5', mr: 2 }} />
              <Typography variant="h4" color="#1e88e5">
                {energyData.totalGeneration.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'إجمالي الإنتاج (MWh)' : 'Total Generation (MWh)'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <PowerIcon sx={{ fontSize: 40, color: '#fb8c00', mr: 2, transform: 'rotate(180deg)' }} />
              <Typography variant="h4" color="#fb8c00">
                {energyData.totalConsumption.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'إجمالي الاستهلاك (MWh)' : 'Total Consumption (MWh)'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <EnergyIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontSize: accessibility.fontSize === 'large' ? '3rem' : '2.5rem',
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              {isRTL ? 'وزارة الطاقة' : 'Ministry of Energy'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
            </Typography>
          </Box>
        </Box>

        {energyData ? (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label={isRTL ? 'نظرة عامة' : 'Overview'}
                  icon={<AnalyticsIcon />}
                  id="energy-tab-0"
                  aria-controls="energy-tabpanel-0"
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              {renderOverview()}
            </TabPanel>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EnergyMinistryPortal;