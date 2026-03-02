import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard,
  Assessment,
  HealthAndSafety,
  School,
  AccountBalance,
  ExitToApp,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [apiStatus, setApiStatus] = useState({ frontend: 'unknown', backend: 'unknown' });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Test Cloudflare integration
    testCloudflareIntegration();
    loadUserData();
  }, [navigate]);

  const testCloudflareIntegration = async () => {
    const results = {
      frontend: 'checking',
      backend: 'checking',
    };

    try {
      // Test frontend (Pages)
      results.frontend = window.location.hostname.includes('pages.dev') ? 'deployed' : 'local';

      // Test backend (Worker)
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        results.backend = (data.status === 'ok' || data.status === 'healthy') ? 'healthy' : 'degraded';
      } else {
        results.backend = 'error';
      }
    } catch (error) {
      results.backend = 'error';
    }

    setApiStatus(results);
    setLoading(false);
  };

  const loadUserData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${apiUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const StatusChip = ({ status }) => {
    const config = {
      healthy: { color: 'success', icon: <CheckCircle />, label: 'Healthy' },
      deployed: { color: 'success', icon: <CheckCircle />, label: 'Deployed' },
      local: { color: 'info', icon: <CheckCircle />, label: 'Local Dev' },
      degraded: { color: 'warning', icon: <Error />, label: 'Degraded' },
      error: { color: 'error', icon: <Error />, label: 'Error' },
      checking: { color: 'default', icon: null, label: 'Checking...' },
      unknown: { color: 'default', icon: null, label: 'Unknown' },
    };

    const { color, icon, label } = config[status] || config.unknown;

    return <Chip color={color} icon={icon} label={label} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <LinearProgress sx={{ width: '300px', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to Sudan Digital Identity Portal
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* Cloudflare Integration Status */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cloudflare Integration Status
          </Typography>
          <Box display="flex" gap={2} mt={1}>
            <Box>
              <Typography variant="caption" display="block" gutterBottom>
                Frontend (Pages):
              </Typography>
              <StatusChip status={apiStatus.frontend} />
            </Box>
            <Box>
              <Typography variant="caption" display="block" gutterBottom>
                Backend (Worker):
              </Typography>
              <StatusChip status={apiStatus.backend} />
            </Box>
          </Box>
        </Alert>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HealthAndSafety color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Health Services</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Access medical records and appointments
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/portal/health')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <School color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Education</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Student records and certifications
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/portal/education')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Finance</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Tax records and payments
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/portal/finance')}
                >
                  Access
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Analytics</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Usage statistics and reports
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/portal')}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Info */}
        {userData && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    OID
                  </Typography>
                  <Typography variant="body1">
                    {userData.oid || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {userData.email || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}
