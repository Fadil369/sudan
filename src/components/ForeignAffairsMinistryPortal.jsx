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
  Public as ForeignAffairsIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

const ForeignAffairsMinistryPortal = ({ language = 'en' }) => {
  const { accessibility } = useAccessibility();
  const [foreignAffairsData, setForeignAffairsData] = useState(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/foreign_affairs');
        const data = await response.json();
        setForeignAffairsData(data);
      } catch (error) {
        console.error('Error fetching foreign affairs data:', error);
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
          {isRTL ? 'نظرة عامة على الشؤون الخارجية' : 'Foreign Affairs Overview'}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5">{foreignAffairsData.missionsAbroad}</Typography>
            <Typography variant="h6" color="text.secondary">{isRTL ? 'البعثات في الخارج' : 'Missions Abroad'}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5">{foreignAffairsData.bilateralAgreements}</Typography>
            <Typography variant="h6" color="text.secondary">{isRTL ? 'الاتفاقيات الثنائية' : 'Bilateral Agreements'}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <ForeignAffairsIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
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
              {isRTL ? 'وزارة الشؤون الخارجية' : 'Ministry of Foreign Affairs'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isRTL ? 'جمهورية السودان' : 'Republic of Sudan'}
            </Typography>
          </Box>
        </Box>

        {foreignAffairsData ? (
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

export default ForeignAffairsMinistryPortal;
