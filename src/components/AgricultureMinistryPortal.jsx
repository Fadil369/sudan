import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Nature as EcoIcon,
  Landscape as LandIcon,
  WaterDrop as WaterIcon,
  Grass as CropIcon,
  Pets as LivestockIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

const AgricultureMinistryPortal = ({ language = 'en', user }) => {
  const { accessibility } = useAccessibility();
  const [agricultureData, setAgricultureData] = useState(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/agriculture');
        const data = await response.json();
        setAgricultureData(data);
      } catch (error) {
        console.error('Error fetching agriculture data:', error);
      }
    };

    fetchData();
  }, []);

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
          {isRTL ? 'نظرة عامة على القطاع الزراعي' : 'Agriculture Sector Overview'}
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#e8f5e8' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EcoIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
              <Typography variant="h4" color="#2e7d32">
                {agricultureData.totalFarmers.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'المزارعون المسجلون' : 'Registered Farmers'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#fff8e1' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LandIcon sx={{ fontSize: 40, color: '#f57c00', mr: 2 }} />
              <Typography variant="h4" color="#f57c00">
                {(agricultureData.registeredLand / 1000000).toFixed(1)}M
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'الأراضي المسجلة' : 'Registered Land'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRTL ? 'هكتار' : 'hectares'}
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
          <AgricultureIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
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
              {isRTL ? 'وزارة الزراعة والثروة الحيوانية' : 'Ministry of Agriculture & Livestock'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
            </Typography>
          </Box>
        </Box>

        {agricultureData ? (
          renderOverview()
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgricultureMinistryPortal;