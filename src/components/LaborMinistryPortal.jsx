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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Work,
  Search,
  Description,
  School,
  TrendingUp,
  Business,
  Assignment,
  AttachMoney,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumStatsCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function LaborMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const laborStats = {
    activeApplications: 2,
    jobMatches: 47,
    completedTrainings: 3,
    workPermitStatus: 'Active',
  };

  const jobListings = [
    {
      title: 'Senior Software Engineer',
      company: 'Sudan Tech Solutions',
      location: 'Khartoum',
      salary: '8,000 - 12,000 SDG',
      type: 'Full-time',
      posted: '2026-02-28',
      applicants: 23,
      match: 95,
      color: '#16a34a',
    },
    {
      title: 'Marketing Manager',
      company: 'Al-Nile Corporation',
      location: 'Omdurman',
      salary: '6,000 - 9,000 SDG',
      type: 'Full-time',
      posted: '2026-02-25',
      applicants: 45,
      match: 87,
      color: '#2563eb',
    },
    {
      title: 'Civil Engineer',
      company: 'Sudan Infrastructure Co.',
      location: 'Port Sudan',
      salary: '7,000 - 10,000 SDG',
      type: 'Full-time',
      posted: '2026-02-20',
      applicants: 31,
      match: 82,
      color: '#ea580c',
    },
  ];

  const myApplications = [
    {
      id: 'APP-2026-0234',
      job: 'Senior Software Engineer',
      company: 'Sudan Tech Solutions',
      status: 'Under Review',
      appliedDate: '2026-03-01',
      progress: 60,
      color: '#2563eb',
    },
    {
      id: 'APP-2026-0189',
      job: 'Data Analyst',
      company: 'National Statistics Bureau',
      status: 'Interview Scheduled',
      appliedDate: '2026-02-25',
      interviewDate: '2026-03-10',
      progress: 75,
      color: '#16a34a',
    },
  ];

  const trainingPrograms = [
    {
      title: 'Digital Skills Development',
      provider: 'Sudan Tech Academy',
      duration: '3 months',
      format: 'Online',
      seats: 50,
      startDate: '2026-04-01',
      fee: 'Free',
      color: '#2563eb',
    },
    {
      title: 'Leadership & Management',
      provider: 'Professional Development Center',
      duration: '6 weeks',
      format: 'Hybrid',
      seats: 30,
      startDate: '2026-03-15',
      fee: '500 SDG',
      color: '#7c3aed',
    },
    {
      title: 'Advanced Excel & Data Analysis',
      provider: 'Business Skills Institute',
      duration: '4 weeks',
      format: 'In-person',
      seats: 25,
      startDate: '2026-03-20',
      fee: '300 SDG',
      color: '#16a34a',
    },
  ];

  const services = [
    {
      title: isRTL ? 'البحث عن وظائف' : 'Job Search',
      description: isRTL
        ? 'تصفح آلاف الوظائف الشاغرة'
        : 'Browse thousands of job openings',
      icon: Search,
      color: '#2563eb',
      featured: true,
      stats: [
        { value: laborStats.jobMatches, label: isRTL ? 'وظيفة متطابقة' : 'Matches' },
      ],
      actions: [
        {
          label: isRTL ? 'ابحث الآن' : 'Search Now',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'طلباتي' : 'My Applications',
      description: isRTL
        ? 'تتبع حالة طلبات التوظيف'
        : 'Track your job application status',
      icon: Assignment,
      color: '#16a34a',
      badge: `${laborStats.activeApplications} ${isRTL ? 'نشط' : 'Active'}`,
      featured: true,
      actions: [
        {
          label: isRTL ? 'عرض الطلبات' : 'View Applications',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'تصاريح العمل' : 'Work Permits',
      description: isRTL
        ? 'التقدم بطلب للحصول على تصاريح العمل'
        : 'Apply for work authorization',
      icon: Description,
      color: '#7c3aed',
      stats: [
        { value: laborStats.workPermitStatus, label: isRTL ? 'الحالة' : 'Status' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض التفاصيل' : 'View Details',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'التدريب والتطوير' : 'Training Programs',
      description: isRTL
        ? 'برامج تطوير المهارات المهنية'
        : 'Professional skills development programs',
      icon: School,
      color: '#ea580c',
      stats: [
        { value: laborStats.completedTrainings, label: isRTL ? 'مكتمل' : 'Completed' },
      ],
      actions: [
        {
          label: isRTL ? 'تصفح البرامج' : 'Browse Programs',
          onClick: () => setCurrentTab(3),
        },
      ],
    },
    {
      title: isRTL ? 'عقود العمل' : 'Employment Contracts',
      description: isRTL
        ? 'إدارة والتحقق من عقود العمل'
        : 'Manage and verify employment contracts',
      icon: Business,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'عرض العقود' : 'View Contracts',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الرواتب والأجور' : 'Salary & Wages',
      description: isRTL
        ? 'معلومات الرواتب والأجور الرسمية'
        : 'Official salary and wage information',
      icon: AttachMoney,
      color: '#16a34a',
      actions: [
        {
          label: isRTL ? 'عرض التفاصيل' : 'View Details',
          onClick: () => {},
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
          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Work sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة العمل' : 'Labor Ministry'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'خدمات التوظيف والتطوير' : 'Employment & Development'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.7"
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
                  title={isRTL ? 'طلبات نشطة' : 'Active Apps'}
                  value={laborStats.activeApplications}
                  icon={Assignment}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'وظائف متطابقة' : 'Job Matches'}
                  value={laborStats.jobMatches}
                  icon={Work}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تدريبات' : 'Trainings'}
                  value={laborStats.completedTrainings}
                  icon={School}
                  color="#7c3aed"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تصريح العمل' : 'Work Permit'}
                  value={laborStats.workPermitStatus}
                  icon={CheckCircle}
                  color="#16a34a"
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
            startIcon={<Search />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'ابحث عن وظائف' : 'Find Jobs'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Assignment />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'طلباتي' : 'My Applications'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<School />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'التدريب' : 'Training'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Description />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'التصاريح' : 'Permits'}
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
          <Tab label={isRTL ? 'البحث عن وظائف' : 'Job Search'} />
          <Tab label={isRTL ? 'طلباتي' : 'My Applications'} />
          <Tab label={isRTL ? 'التدريب' : 'Training'} />
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

          {/* Job Search Tab */}
          {currentTab === 1 && (
            <Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  placeholder={isRTL ? 'ابحث عن وظيفة...' : 'Search for jobs...'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>

              <Grid container spacing={3}>
                {jobListings.map((job, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${job.color}20`,
                        '&:hover': {
                          borderColor: job.color,
                          boxShadow: `0 4px 12px ${job.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {job.company} • {job.location}
                          </Typography>
                          <Box display="flex" gap={1} mt={1} mb={2}>
                            <Chip label={job.type} size="small" color="primary" />
                            <Chip label={job.salary} size="small" variant="outlined" />
                            <Chip
                              label={`${job.match}% ${isRTL ? 'تطابق' : 'Match'}`}
                              size="small"
                              sx={{
                                bgcolor: `${job.color}15`,
                                color: job.color,
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'منشور' : 'Posted'}: {job.posted} • {job.applicants} {isRTL ? 'متقدم' : 'applicants'}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={1} ml={2}>
                          <Button variant="contained" sx={{ bgcolor: job.color }}>
                            {isRTL ? 'تقدم الآن' : 'Apply Now'}
                          </Button>
                          <Button variant="outlined">
                            {isRTL ? 'حفظ' : 'Save'}
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* My Applications Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'طلبات التوظيف الخاصة بي' : 'My Job Applications'}
              </Typography>

              <Grid container spacing={3}>
                {myApplications.map((app, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${app.color}30`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {app.job}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {app.company} • {app.id}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              label={app.status}
                              size="small"
                              sx={{
                                bgcolor: `${app.color}15`,
                                color: app.color,
                                fontWeight: 600,
                              }}
                            />
                            {app.interviewDate && (
                              <Chip
                                label={`Interview: ${app.interviewDate}`}
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                        </Box>
                        <Button variant="contained">
                          {isRTL ? 'التفاصيل' : 'Details'}
                        </Button>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'تاريخ التقديم' : 'Applied'}: {app.appliedDate}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: app.color }}>
                            {app.progress}% {isRTL ? 'تقدم' : 'Progress'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={app.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${app.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: app.color,
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

          {/* Training Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'برامج التدريب المتاحة' : 'Available Training Programs'}
              </Typography>

              <Grid container spacing={3}>
                {trainingPrograms.map((program, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${program.color}20`,
                        '&:hover': {
                          borderColor: program.color,
                          boxShadow: `0 4px 12px ${program.color}20`,
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {program.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {program.provider}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'المدة' : 'Duration'}
                            secondary={program.duration}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الصيغة' : 'Format'}
                            secondary={program.format}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'البدء' : 'Starts'}
                            secondary={program.startDate}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الرسوم' : 'Fee'}
                            secondary={program.fee}
                          />
                        </ListItem>
                      </List>
                      <Chip
                        label={`${program.seats} ${isRTL ? 'مقعد متاح' : 'seats available'}`}
                        size="small"
                        sx={{
                          mb: 2,
                          bgcolor: `${program.color}15`,
                          color: program.color,
                          fontWeight: 600,
                        }}
                      />
                      <Button fullWidth variant="contained" sx={{ bgcolor: program.color }}>
                        {isRTL ? 'تسجيل الآن' : 'Enroll Now'}
                      </Button>
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
