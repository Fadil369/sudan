import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  LineChart,
  BarChart,
  ResponsiveChartContainer,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltip,
  BarPlot
} from '@mui/x-charts';
import { useAccessibility } from './AccessibilityProvider';
import {
  citizenRegistrationData,
  serviceUsageData,
  transactionVolumeData,
  userSatisfactionData,
  systemUptimeData
} from '../data/analytics-data';

const AnalyticsDashboard = ({ language = 'en' }) => {
  const { accessibility } = useAccessibility();
  const isRTL = language === 'ar';

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {isRTL ? 'لوحة تحليلات متقدمة' : 'Advanced Analytics Dashboard'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'اتجاهات تسجيل المواطنين' : 'Citizen Registration Trends'}
              </Typography>
              <ResponsiveChartContainer
                series={[{
                  type: 'line',
                  data: citizenRegistrationData.map(d => d.registrations),
                }]}
                xAxis={[{
                  scaleType: 'point',
                  data: citizenRegistrationData.map(d => d.date),
                }]}
                height={300}
              >
                <LineChart />
                <ChartsXAxis />
                <ChartsYAxis />
                <ChartsTooltip />
              </ResponsiveChartContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'استخدام الخدمة حسب الوزارة' : 'Service Usage by Department'}
              </Typography>
              <ResponsiveChartContainer
                series={[{
                  type: 'bar',
                  data: serviceUsageData.map(d => d.usage),
                }]}
                xAxis={[{
                  scaleType: 'band',
                  data: serviceUsageData.map(d => d.department),
                }]}
                height={300}
              >
                <BarPlot />
                <ChartsXAxis />
                <ChartsYAxis />
                <ChartsTooltip />
              </ResponsiveChartContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'حجم المعاملات' : 'Transaction Volume'}
              </Typography>
              <ResponsiveChartContainer
                series={[{
                  type: 'line',
                  data: transactionVolumeData.map(d => d.volume),
                }]}
                xAxis={[{
                  scaleType: 'point',
                  data: transactionVolumeData.map(d => d.date),
                }]}
                height={300}
              >
                <LineChart />
                <ChartsXAxis />
                <ChartsYAxis />
                <ChartsTooltip />
              </ResponsiveChartContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'رضا المستخدم' : 'User Satisfaction'}
              </Typography>
              <Typography variant="h2" color="primary" sx={{ textAlign: 'center', mt: 4 }}>
                {userSatisfactionData.average}/5
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'وقت تشغيل النظام' : 'System Uptime'}
              </Typography>
              <Typography variant="h2" color="primary" sx={{ textAlign: 'center', mt: 4 }}>
                {systemUptimeData.uptime}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;