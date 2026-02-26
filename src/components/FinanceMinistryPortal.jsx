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

const FinanceMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [financeData, setFinanceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/finance');
        const data = await response.json();
        setFinanceData(data);
      } catch (error) {
        console.error('Error fetching finance data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isRTL ? 'بوابة وزارة المالية' : 'Ministry of Finance Portal'}
        </Typography>
        {financeData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{financeData.gdp}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'الناتج المحلي الإجمالي' : 'GDP'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{financeData.inflation}%</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'التضخم' : 'Inflation'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default FinanceMinistryPortal;
