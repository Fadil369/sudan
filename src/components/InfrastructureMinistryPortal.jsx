import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  LocationCity,
  Construction,
  DirectionsBus,
  LocalParking,
  Traffic,
  Map,
  Description,
  CheckCircle,
  Pending,
  Download,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function InfrastructureMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const infraStats = {
    activePermits: 1,
    roadReports: 0,
    publicTransportPass: 'Active',
    applications: 2,
  };

  const myPermits = [
    {
      id: 'BUILD-2026-001',
      type: 'Construction Permit',
      project: 'Residential Building - 3 Floors',
      location: 'Al-Riyadh, Khartoum',
      status: 'Approved',
      issueDate: '2026-02-15',
      expiryDate: '2027-02-14',
      progress: 100,
      color: '#16a34a',
    },
    {
      id: 'DEMO-2026-045',
      type: 'Demolition Permit',
      project: 'Old Structure Removal',
      location: 'Omdurman',
      status: 'Under Review',
      submittedDate: '2026-02-28',
      progress: 40,
      color: '#ea580c',
    },
  ];

  const publicProjects = [
    {
      name: 'Khartoum Metro Line 1',
      description: 'New metro line connecting Khartoum to Bahri',
      status: 'Under Construction',
      completion: 65,
      expectedDate: '2027-12-31',
      budget: '2.5B SDG',
      color: '#2563eb',
    },
    {
      name: 'Nile Bridge Expansion',
      description: 'Expansion of Blue Nile Bridge',
      status: 'Planning',
      completion: 15,
      expectedDate: '2028-06-30',
      budget: '850M SDG',
      color: '#7c3aed',
    },
    {
      name: 'Khartoum Ring Road',
      description: 'New ring road around Greater Khartoum',
      status: 'Under Construction',
      completion: 45,
      expectedDate: '2027-09-30',
      budget: '1.2B SDG',
      color: '#16a34a',
    },
  ];

  const services = [
    {
      title: isRTL ? 'تصاريح البناء' : 'Construction Permits',
      description: isRTL
        ? 'التقدم بطلب للحصول على تصاريح البناء والهدم'
        : 'Apply for building and demolition permits',
      icon: Construction,
      color: '#6b7280',
      featured: true,
      stats: [
        { value: infraStats.activePermits, label: isRTL ? 'نشط' : 'Active' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض التصاريح' : 'View Permits',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'النقل العام' : 'Public Transport',
      description: isRTL
        ? 'تصاريح النقل العام والخرائط'
        : 'Public transport passes and route maps',
      icon: DirectionsBus,
      color: '#2563eb',
      featured: true,
      badge: infraStats.publicTransportPass,
      actions: [
        {
          label: isRTL ? 'عرض التصريح' : 'View Pass',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'التخطيط الحضري' : 'Urban Planning',
      description: isRTL
        ? 'خرائط التخطيط الحضري ومناطق التطوير'
        : 'Urban planning maps and development zones',
      icon: Map,
      color: '#16a34a',
      actions: [
        {
          label: isRTL ? 'عرض الخرائط' : 'View Maps',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الإبلاغ عن الطرق' : 'Road Reports',
      description: isRTL
        ? 'الإبلاغ عن مشاكل الطرق والبنية التحتية'
        : 'Report road and infrastructure issues',
      icon: Traffic,
      color: '#ea580c',
      badge: isRTL ? 'متاح 24/7' : 'Available 24/7',
      actions: [
        {
          label: isRTL ? 'إبلاغ' : 'Report',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'مواقف السيارات' : 'Parking Permits',
      description: isRTL
        ? 'التقدم بطلب للحصول على تصاريح مواقف السيارات'
        : 'Apply for public parking permits',
      icon: LocalParking,
      color: '#7c3aed',
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'المشاريع العامة' : 'Public Projects',
      description: isRTL
        ? 'عرض حالة مشاريع البنية التحتية'
        : 'View status of infrastructure projects',
      icon: LocationCity,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'عرض المشاريع' : 'View Projects',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <LocationCity sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'البنية التحتية' : 'Infrastructure'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'التطوير والتخطيط الحضري' : 'Development & Urban Planning'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.11"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تصاريح نشطة' : 'Active Permits'}
                  value={infraStats.activePermits}
                  icon={Construction}
                  color="#6b7280"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تقارير الطرق' : 'Road Reports'}
                  value={infraStats.roadReports}
                  icon={Traffic}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'نقل عام' : 'Transport'}
                  value={infraStats.publicTransportPass}
                  icon={DirectionsBus}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'طلبات' : 'Applications'}
                  value={infraStats.applications}
                  icon={Pending}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Construction />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'التصاريح' : 'Permits'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<DirectionsBus />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'النقل العام' : 'Transport'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Traffic />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'إبلاغ عن مشكلة' : 'Report Issue'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Map />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'الخرائط' : 'Maps'}
          </Button>
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab label={isRTL ? 'نظرة عامة' : 'Overview'} />
          <Tab label={isRTL ? 'التصاريح' : 'My Permits'} />
          <Tab label={isRTL ? 'المشاريع العامة' : 'Public Projects'} />
        </Tabs>

        <Box p={3}>
          {/* Overview Tab */}
          {currentTab === 0 && (
            <Grid container spacing={3}>
              {services.map((service, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <PremiumServiceCard {...service} language={language} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* My Permits Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'التصاريح الخاصة بي' : 'My Permits'}
                </Typography>
                <Button variant="outlined" startIcon={<Construction />}>
                  {isRTL ? 'طلب جديد' : 'New Application'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {myPermits.map((permit, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${permit.color}30`,
                        '&:hover': {
                          borderColor: permit.color,
                          boxShadow: `0 4px 12px ${permit.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {permit.project}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {permit.type} • ID: {permit.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {permit.location}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              label={permit.status}
                              size="small"
                              color={permit.status === 'Approved' ? 'success' : 'warning'}
                              sx={{ fontWeight: 600 }}
                            />
                            {permit.expiryDate && (
                              <Chip
                                label={`${isRTL ? 'ينتهي في' : 'Expires'}: ${permit.expiryDate}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={1} ml={2}>
                          <Button variant="contained">
                            {isRTL ? 'التفاصيل' : 'Details'}
                          </Button>
                          {permit.status === 'Approved' && (
                            <Button variant="outlined" startIcon={<Download />}>
                              {isRTL ? 'تنزيل' : 'Download'}
                            </Button>
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {permit.issueDate ? (isRTL ? 'تاريخ الإصدار' : 'Issued') : (isRTL ? 'تاريخ التقديم' : 'Submitted')}: {permit.issueDate || permit.submittedDate}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: permit.color }}>
                            {permit.progress}% {isRTL ? 'مكتمل' : 'Complete'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={permit.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${permit.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: permit.color,
                            },
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Public Projects Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'مشاريع البنية التحتية الجارية' : 'Ongoing Infrastructure Projects'}
              </Typography>

              <Grid container spacing={3}>
                {publicProjects.map((project, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${project.color}20`,
                        '&:hover': {
                          borderColor: project.color,
                          boxShadow: `0 4px 12px ${project.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: project.color }}>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {project.description}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip label={project.status} size="small" sx={{ bgcolor: `${project.color}15`, color: project.color, fontWeight: 600 }} />
                            <Chip label={`${isRTL ? 'الميزانية' : 'Budget'}: ${project.budget}`} size="small" variant="outlined" />
                            <Chip label={`${isRTL ? 'المتوقع' : 'Expected'}: ${project.expectedDate}`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'التقدم' : 'Progress'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: project.color }}>
                            {project.completion}% {isRTL ? 'مكتمل' : 'Complete'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.completion}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: `${project.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              bgcolor: project.color,
                            },
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
