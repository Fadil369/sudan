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
import { useAccessibility } from './AccessibilityProvider';

const EducationMinistryPortal = ({ language = 'en' }) => {
  const { accessibility } = useAccessibility();
  const isRTL = language === 'ar';
  const [educationData, setEducationData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/education');
        const data = await response.json();
        setEducationData(data);
      } catch (error) {
        console.error('Error fetching education data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isRTL ? 'بوابة وزارة التربية والتعليم' : 'Ministry of Education Portal'}
        </Typography>
        {educationData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{educationData.schools}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'المدارس' : 'Schools'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{educationData.students}</Typography>
                  <Typography variant="h6" color="text.secondary">{isRTL ? 'الطلاب' : 'Students'}</Typography>
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

export default EducationMinistryPortal;
