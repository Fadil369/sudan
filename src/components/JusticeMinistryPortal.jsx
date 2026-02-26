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
  Gavel as JusticeIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

const JusticeMinistryPortal = ({ language = 'en' }) => {
  const { accessibility } = useAccessibility();
  const [justiceData, setJusticeData] = useState(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/justice');
        const data = await response.json();
        setJusticeData(data);
      } catch (error) {
        console.error('Error fetching justice data:', error);
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
          {isRTL ? 'نظرة عامة على النظام القضائي' : 'Judicial System Overview'}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5">{justiceData.totalCases.toLocaleString()}</Typography>
            <Typography variant="h6" color="text.secondary">{isRTL ? 'إجمالي القضايا' : 'Total Cases'}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5">{justiceData.resolvedCases.toLocaleString()}</Typography>
            <Typography variant="h6" color="text.secondary">{isRTL ? 'القضايا المحلولة' : 'Resolved Cases'}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <JusticeIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
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
              {isRTL ? 'وزارة العدل' : 'Ministry of Justice'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
            </Typography>
          </Box>
        </Box>

        {justiceData ? (
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

export default JusticeMinistryPortal;
