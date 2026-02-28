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
        <Card sx={{ height: '100%', bgcolor: '#DCFCE7', border: '1px solid #BBF7D0', borderTop: '3px solid #1D6330' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EcoIcon sx={{ fontSize: 36, color: '#1D6330', mr: 2 }} />
              <Typography variant="h4" color="#1D6330" fontWeight={700}>
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
        <Card sx={{ height: '100%', bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderTop: '3px solid #7A5200' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LandIcon sx={{ fontSize: 36, color: '#7A5200', mr: 2 }} />
              <Typography variant="h4" color="#7A5200" fontWeight={700}>
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
          <AgricultureIcon sx={{ fontSize: 40, color: '#1D6330', mr: 2 }} />
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontSize: accessibility.fontSize === 'large' ? '3rem' : '2.5rem',
                fontWeight: 'bold',
                color: '#1D6330'
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