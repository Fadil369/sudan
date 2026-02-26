import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box
} from '@mui/material';

const HealthMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealthData(data);
      } catch (error) {
        console.error('Error fetching health data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isRTL ? 'بوابة وزارة الصحة' : 'Ministry of Health Portal'}
        </Typography>
        {healthData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{healthData.hospitals}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'المستشفيات' : 'Hospitals'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{healthData.beds}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'الأسرة' : 'Beds'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{healthData.doctors}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'الأطباء' : 'Doctors'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography>{isRTL ? 'جار التحميل...' : 'Loading...'}</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default HealthMinistryPortal;
