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
  Business as InfrastructureIcon,
  AddRoad as RoadIcon,
  LocationCity as LocationIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

const InfrastructureMinistryPortal = ({ language = 'en' }) => {
  const { accessibility } = useAccessibility();
  const [infrastructureData, setInfrastructureData] = useState(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/infrastructure');
        const data = await response.json();
        setInfrastructureData(data);
      } catch (error) {
        console.error('Error fetching infrastructure data:', error);
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
          {isRTL ? 'نظرة عامة على البنية التحتية' : 'Infrastructure Overview'}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#f3e5f5' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <RoadIcon sx={{ fontSize: 40, color: '#8e24aa', mr: 2 }} />
              <Typography variant="h4" color="#8e24aa">
                {infrastructureData.roadNetwork.toLocaleString()} km
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'شبكة الطرق' : 'Road Network'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: '#e1f5fe' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon sx={{ fontSize: 40, color: '#0277bd', mr: 2 }} />
              <Typography variant="h4" color="#0277bd">
                {infrastructureData.bridges.toLocaleString()}
              </Typography>
            </Box>
            <Typography variant="h6">
              {isRTL ? 'الجسور' : 'Bridges'}
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
          <InfrastructureIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
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
              {isRTL ? 'وزارة البنية التحتية' : 'Ministry of Infrastructure'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
            </Typography>
          </Box>
        </Box>

        {infrastructureData ? (
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

export default InfrastructureMinistryPortal;
