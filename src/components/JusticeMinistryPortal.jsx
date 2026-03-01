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
  Gavel,
  Description,
  Event,
  Search,
  Download,
  VideoCall,
  Person,
  AttachFile,
  Schedule,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function JusticeMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const justiceStats = {
    activeCases: 3,
    completedCases: 12,
    upcomingHearings: 2,
    legalDocuments: 8,
  };

  const myCases = [
    {
      id: 'CIV-2026-00234',
      title: 'Property Dispute - Al-Riyadh District',
      type: 'Civil',
      status: 'Active',
      nextHearing: '2026-03-15',
      court: 'Khartoum Central Court',
      judge: 'Hon. Ahmed Al-Mahdi',
      progress: 65,
      color: '#2563eb',
    },
    {
      id: 'FAM-2026-00089',
      title: 'Divorce Settlement',
      type: 'Family',
      status: 'Pending',
      nextHearing: '2026-03-20',
      court: 'Family Court - Omdurman',
      judge: 'Hon. Fatima Hassan',
      progress: 40,
      color: '#7c3aed',
    },
    {
      id: 'CIV-2025-01456',
      title: 'Contract Breach Case',
      type: 'Civil',
      status: 'Completed',
      closedDate: '2026-02-10',
      court: 'Khartoum Commercial Court',
      judge: 'Hon. Ibrahim Malik',
      progress: 100,
      color: '#16a34a',
    },
  ];

  const upcomingHearings = [
    {
      caseId: 'CIV-2026-00234',
      date: '2026-03-15',
      time: '10:00 AM',
      court: 'Khartoum Central Court',
      courtroom: 'Room 3A',
      type: 'Hearing',
      judge: 'Hon. Ahmed Al-Mahdi',
      color: '#2563eb',
    },
    {
      caseId: 'FAM-2026-00089',
      date: '2026-03-20',
      time: '02:30 PM',
      court: 'Family Court - Omdurman',
      courtroom: 'Room 1B',
      type: 'Mediation',
      judge: 'Hon. Fatima Hassan',
      color: '#7c3aed',
    },
  ];

  const courtSchedule = [
    {
      court: 'Khartoum Central Court',
      availability: 'Open',
      hours: '08:00 AM - 04:00 PM',
      contact: '+249-123-456-789',
      color: '#16a34a',
    },
    {
      court: 'Family Court - Omdurman',
      availability: 'Open',
      hours: '09:00 AM - 03:00 PM',
      contact: '+249-123-456-790',
      color: '#2563eb',
    },
    {
      court: 'Commercial Court',
      availability: 'Closed - Weekend',
      hours: '08:00 AM - 02:00 PM (Sun-Thu)',
      contact: '+249-123-456-791',
      color: '#dc2626',
    },
  ];

  const legalServices = [
    {
      name: 'Adv. Mohammed Al-Tayeb',
      specialty: 'Civil Law',
      experience: '15 years',
      rating: 4.8,
      cases: 234,
      color: '#2563eb',
    },
    {
      name: 'Adv. Sara Ibrahim',
      specialty: 'Family Law',
      experience: '12 years',
      rating: 4.9,
      cases: 189,
      color: '#7c3aed',
    },
    {
      name: 'Adv. Khalid Ahmed',
      specialty: 'Commercial Law',
      experience: '18 years',
      rating: 4.7,
      cases: 312,
      color: '#16a34a',
    },
  ];

  const services = [
    {
      title: isRTL ? 'القضايا النشطة' : 'Active Cases',
      description: isRTL
        ? 'عرض وإدارة قضاياك النشطة'
        : 'View and manage your active legal cases',
      icon: Gavel,
      color: '#2563eb',
      featured: true,
      stats: [
        { value: justiceStats.activeCases, label: isRTL ? 'نشط' : 'Active' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض القضايا' : 'View Cases',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'جدول الجلسات' : 'Hearing Schedule',
      description: isRTL
        ? 'مواعيد الجلسات القادمة والتذكيرات'
        : 'Upcoming hearing dates and reminders',
      icon: Event,
      color: '#7c3aed',
      badge: `${justiceStats.upcomingHearings} ${isRTL ? 'قادمة' : 'Upcoming'}`,
      featured: true,
      actions: [
        {
          label: isRTL ? 'عرض الجدول' : 'View Schedule',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'المستندات القانونية' : 'Legal Documents',
      description: isRTL
        ? 'الوصول إلى ملفاتك ومستنداتك القانونية'
        : 'Access your legal files and documents',
      icon: Description,
      color: '#16a34a',
      stats: [
        { value: justiceStats.legalDocuments, label: isRTL ? 'مستند' : 'Documents' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض المستندات' : 'View Docs',
          onClick: () => setCurrentTab(3),
        },
      ],
    },
    {
      title: isRTL ? 'دليل المحامين' : 'Lawyer Directory',
      description: isRTL
        ? 'البحث عن محامين معتمدين'
        : 'Search for certified lawyers',
      icon: Person,
      color: '#ea580c',
      badge: isRTL ? '127 متاح' : '127 Available',
      actions: [
        {
          label: isRTL ? 'بحث' : 'Search',
          onClick: () => setCurrentTab(4),
        },
      ],
    },
    {
      title: isRTL ? 'المحاكم الافتراضية' : 'Virtual Court',
      description: isRTL
        ? 'حضور الجلسات عبر الفيديو'
        : 'Attend hearings via video call',
      icon: VideoCall,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'انضم الآن' : 'Join Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'البحث في القضايا' : 'Case Search',
      description: isRTL
        ? 'البحث في السجلات العامة للقضايا'
        : 'Search public case records',
      icon: Search,
      color: '#dc2626',
      actions: [
        {
          label: isRTL ? 'بحث' : 'Search',
          onClick: () => {},
        },
      ],
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Pending sx={{ color: '#2563eb' }} />;
      case 'Completed':
        return <CheckCircle sx={{ color: '#16a34a' }} />;
      case 'Pending':
        return <Schedule sx={{ color: '#ea580c' }} />;
      default:
        return <Cancel sx={{ color: '#dc2626' }} />;
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Gavel sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة العدل' : 'Ministry of Justice'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'نظام القضاء الرقمي' : 'Digital Justice System'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.5"
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
                  title={isRTL ? 'قضايا نشطة' : 'Active Cases'}
                  value={justiceStats.activeCases}
                  icon={Gavel}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'مكتملة' : 'Completed'}
                  value={justiceStats.completedCases}
                  icon={CheckCircle}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'جلسات قادمة' : 'Hearings'}
                  value={justiceStats.upcomingHearings}
                  icon={Event}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'مستندات' : 'Documents'}
                  value={justiceStats.legalDocuments}
                  icon={Description}
                  color="#7c3aed"
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
            startIcon={<Gavel />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'قضاياي' : 'My Cases'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Event />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'الجلسات' : 'Hearings'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<VideoCall />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'محكمة افتراضية' : 'Virtual Court'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Download />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'المستندات' : 'Documents'}
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
          <Tab label={isRTL ? 'قضاياي' : 'My Cases'} />
          <Tab label={isRTL ? 'جدول الجلسات' : 'Hearing Schedule'} />
          <Tab label={isRTL ? 'المستندات' : 'Documents'} />
          <Tab label={isRTL ? 'دليل المحامين' : 'Lawyer Directory'} />
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

          {/* My Cases Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'قضاياي' : 'My Cases'}
                </Typography>
                <Button variant="outlined" startIcon={<AttachFile />}>
                  {isRTL ? 'رفع قضية جديدة' : 'File New Case'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {myCases.map((caseItem, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${caseItem.color}30`,
                        '&:hover': {
                          borderColor: caseItem.color,
                          boxShadow: `0 4px 12px ${caseItem.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            {getStatusIcon(caseItem.status)}
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {caseItem.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Case ID: {caseItem.id} • {caseItem.court}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip label={caseItem.type} size="small" sx={{ bgcolor: `${caseItem.color}15`, color: caseItem.color, fontWeight: 600 }} />
                            <Chip label={caseItem.status} size="small" color={caseItem.status === 'Completed' ? 'success' : caseItem.status === 'Active' ? 'primary' : 'warning'} />
                            {caseItem.nextHearing && (
                              <Chip label={`Next: ${caseItem.nextHearing}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                        <Button variant="contained" sx={{ ml: 2 }}>
                          {isRTL ? 'التفاصيل' : 'Details'}
                        </Button>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'القاضي' : 'Judge'}: {caseItem.judge}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: caseItem.color }}>
                            {caseItem.progress}% {isRTL ? 'مكتمل' : 'Complete'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={caseItem.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${caseItem.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: caseItem.color,
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

          {/* Hearing Schedule Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'الجلسات القادمة' : 'Upcoming Hearings'}
              </Typography>

              <Grid container spacing={3}>
                {upcomingHearings.map((hearing, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${hearing.color}30`,
                        background: `linear-gradient(135deg, ${hearing.color}05 0%, #ffffff 100%)`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: hearing.color }}>
                            {hearing.caseId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hearing.type}
                          </Typography>
                        </Box>
                        <Chip
                          label={hearing.date}
                          sx={{
                            bgcolor: `${hearing.color}15`,
                            color: hearing.color,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الوقت' : 'Time'}
                            secondary={hearing.time}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'المحكمة' : 'Court'}
                            secondary={hearing.court}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'القاعة' : 'Courtroom'}
                            secondary={hearing.courtroom}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'القاضي' : 'Judge'}
                            secondary={hearing.judge}
                          />
                        </ListItem>
                      </List>
                      <Box display="flex" gap={2} mt={2}>
                        <Button fullWidth variant="contained" startIcon={<VideoCall />}>
                          {isRTL ? 'انضم افتراضياً' : 'Join Virtual'}
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<Download />}>
                          {isRTL ? 'تنزيل الملف' : 'Download'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'جدول المحاكم' : 'Court Schedule'}
              </Typography>

              <Grid container spacing={2}>
                {courtSchedule.map((court, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `2px solid ${court.color}30`,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                        {court.court}
                      </Typography>
                      <Chip
                        label={court.availability}
                        size="small"
                        sx={{
                          mb: 1,
                          bgcolor: `${court.color}15`,
                          color: court.color,
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {isRTL ? 'ساعات العمل' : 'Hours'}: {court.hours}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {isRTL ? 'الاتصال' : 'Contact'}: {court.contact}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Documents Tab */}
          {currentTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'المستندات القانونية' : 'Legal Documents'}
                </Typography>
                <Button variant="outlined" startIcon={<AttachFile />}>
                  {isRTL ? 'رفع مستند' : 'Upload Document'}
                </Button>
              </Box>

              <Typography variant="body1" color="text.secondary">
                {isRTL
                  ? 'جميع مستنداتك القانونية متاحة هنا للتحميل والعرض.'
                  : 'All your legal documents are available here for download and viewing.'}
              </Typography>
            </Box>
          )}

          {/* Lawyer Directory Tab */}
          {currentTab === 4 && (
            <Box>
              <Box mb={3}>
                <TextField
                  fullWidth
                  placeholder={isRTL ? 'ابحث عن محامي...' : 'Search for lawyers...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              </Box>

              <Grid container spacing={3}>
                {legalServices.map((lawyer, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${lawyer.color}20`,
                        '&:hover': {
                          borderColor: lawyer.color,
                          boxShadow: `0 4px 12px ${lawyer.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${lawyer.color}15`,
                            color: lawyer.color,
                          }}
                        >
                          <Person sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {lawyer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lawyer.specialty}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'الخبرة' : 'Experience'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {lawyer.experience}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'التقييم' : 'Rating'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: lawyer.color }}>
                          ⭐ {lawyer.rating}/5.0
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'القضايا المكتملة' : 'Cases Completed'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {lawyer.cases}
                        </Typography>
                      </Box>
                      <Button fullWidth variant="contained" sx={{ bgcolor: lawyer.color }}>
                        {isRTL ? 'حجز استشارة' : 'Book Consultation'}
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
