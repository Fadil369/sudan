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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Public,
  Flight,
  ContactMail,
  Language,
  CardTravel,
  LocationOn,
  Download,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function ForeignAffairsMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const foreignStats = {
    activeApplications: 2,
    issuedDocuments: 5,
    embassies: 47,
    travelAdvisories: 3,
  };

  const myApplications = [
    {
      id: 'PASS-2026-0234',
      type: 'Passport Renewal',
      status: 'In Progress',
      progress: 75,
      submittedDate: '2026-02-20',
      expectedDate: '2026-03-10',
      currentStep: 2,
      totalSteps: 3,
      color: '#2563eb',
    },
    {
      id: 'VISA-2026-0089',
      type: 'Visa Application - Egypt',
      status: 'Under Review',
      progress: 50,
      submittedDate: '2026-02-28',
      expectedDate: '2026-03-15',
      currentStep: 1,
      totalSteps: 3,
      color: '#7c3aed',
    },
  ];

  const embassies = [
    {
      country: 'Egypt',
      city: 'Cairo',
      address: '12 Nile Street, Zamalek, Cairo',
      phone: '+20-2-123-4567',
      email: 'embassy.cairo@sudan.gov.sd',
      hours: 'Sun-Thu: 8:00 AM - 3:00 PM',
      services: ['Visa', 'Passport', 'Consular'],
      color: '#2563eb',
    },
    {
      country: 'Saudi Arabia',
      city: 'Riyadh',
      address: 'Diplomatic Quarter, Riyadh',
      phone: '+966-11-234-5678',
      email: 'embassy.riyadh@sudan.gov.sd',
      hours: 'Sun-Thu: 8:00 AM - 3:00 PM',
      services: ['Visa', 'Passport', 'Hajj Services'],
      color: '#16a34a',
    },
    {
      country: 'UAE',
      city: 'Abu Dhabi',
      address: 'Diplomatic Area, Abu Dhabi',
      phone: '+971-2-345-6789',
      email: 'embassy.abudhabi@sudan.gov.sd',
      hours: 'Sun-Thu: 8:00 AM - 2:00 PM',
      services: ['Visa', 'Business Support'],
      color: '#ea580c',
    },
  ];

  const travelAdvisories = [
    {
      country: 'Syria',
      level: 'High Risk',
      advisory: 'Do not travel',
      details: 'Armed conflict and civil unrest',
      color: '#dc2626',
      updated: '2026-03-01',
    },
    {
      country: 'Yemen',
      level: 'High Risk',
      advisory: 'Do not travel',
      details: 'Armed conflict and terrorism',
      color: '#dc2626',
      updated: '2026-02-28',
    },
    {
      country: 'Libya',
      level: 'Medium Risk',
      advisory: 'Exercise caution',
      details: 'Political instability',
      color: '#ea580c',
      updated: '2026-02-25',
    },
  ];

  const issuedDocuments = [
    {
      type: 'Passport',
      number: 'P12345678',
      issueDate: '2021-03-15',
      expiryDate: '2031-03-14',
      status: 'Valid',
      color: '#16a34a',
    },
    {
      type: 'Travel Permit',
      number: 'TP87654321',
      issueDate: '2026-01-10',
      expiryDate: '2026-07-10',
      status: 'Valid',
      color: '#2563eb',
    },
  ];

  const services = [
    {
      title: isRTL ? 'تجديد جواز السفر' : 'Passport Renewal',
      description: isRTL
        ? 'تجديد أو إصدار جواز سفر جديد'
        : 'Renew or issue new passport',
      icon: CardTravel,
      color: '#2563eb',
      featured: true,
      badge: isRTL ? '1 قيد التنفيذ' : '1 In Progress',
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'طلب تأشيرة' : 'Visa Application',
      description: isRTL
        ? 'التقدم بطلب للحصول على تأشيرة سفر'
        : 'Apply for travel visa',
      icon: Flight,
      color: '#7c3aed',
      featured: true,
      stats: [
        { value: foreignStats.activeApplications, label: isRTL ? 'نشط' : 'Active' },
      ],
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'دليل السفارات' : 'Embassy Directory',
      description: isRTL
        ? 'العثور على معلومات السفارات السودانية'
        : 'Find Sudanese embassy information',
      icon: LocationOn,
      color: '#16a34a',
      stats: [
        { value: `${foreignStats.embassies}`, label: isRTL ? 'سفارة' : 'Embassies' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض الدليل' : 'View Directory',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'تنبيهات السفر' : 'Travel Advisories',
      description: isRTL
        ? 'تحذيرات وتحديثات السلامة أثناء السفر'
        : 'Travel safety warnings and updates',
      icon: Warning,
      color: '#dc2626',
      badge: `${foreignStats.travelAdvisories} ${isRTL ? 'نشط' : 'Active'}`,
      actions: [
        {
          label: isRTL ? 'عرض التنبيهات' : 'View Advisories',
          onClick: () => setCurrentTab(3),
        },
      ],
    },
    {
      title: isRTL ? 'الخدمات القنصلية' : 'Consular Services',
      description: isRTL
        ? 'المساعدة للمواطنين في الخارج'
        : 'Assistance for citizens abroad',
      icon: ContactMail,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'اتصل بنا' : 'Contact Us',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الترجمة والتصديق' : 'Translation & Attestation',
      description: isRTL
        ? 'ترجمة وتصديق المستندات الرسمية'
        : 'Document translation and attestation',
      icon: Language,
      color: '#ea580c',
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Submit Request',
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
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <Public sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة الخارجية' : 'Foreign Affairs'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'الخدمات الدبلوماسية' : 'Diplomatic Services'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.6"
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
                  value={foreignStats.activeApplications}
                  icon={Flight}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'مستندات صادرة' : 'Issued Docs'}
                  value={foreignStats.issuedDocuments}
                  icon={CardTravel}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'سفارات' : 'Embassies'}
                  value={foreignStats.embassies}
                  icon={LocationOn}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'تنبيهات' : 'Advisories'}
                  value={foreignStats.travelAdvisories}
                  icon={Warning}
                  color="#dc2626"
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
            startIcon={<CardTravel />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'تجديد جواز السفر' : 'Renew Passport'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Flight />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'طلب تأشيرة' : 'Apply Visa'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<LocationOn />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'السفارات' : 'Embassies'}
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
          <Tab label={isRTL ? 'طلباتي' : 'My Applications'} />
          <Tab label={isRTL ? 'دليل السفارات' : 'Embassy Directory'} />
          <Tab label={isRTL ? 'تنبيهات السفر' : 'Travel Advisories'} />
          <Tab label={isRTL ? 'المستندات' : 'Documents'} />
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

          {/* My Applications Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'طلباتي' : 'My Applications'}
                </Typography>
                <Button variant="outlined" startIcon={<Flight />}>
                  {isRTL ? 'طلب جديد' : 'New Application'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                {myApplications.map((app, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${app.color}30`,
                        '&:hover': {
                          borderColor: app.color,
                          boxShadow: `0 4px 12px ${app.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {app.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Application ID: {app.id}
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
                            <Chip
                              label={`Step ${app.currentStep}/${app.totalSteps}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Button variant="contained">
                          {isRTL ? 'التفاصيل' : 'Details'}
                        </Button>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Stepper activeStep={app.currentStep} sx={{ mb: 2 }}>
                        <Step>
                          <StepLabel>
                            {isRTL ? 'تقديم الطلب' : 'Application Submitted'}
                          </StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>
                            {isRTL ? 'قيد المراجعة' : 'Under Review'}
                          </StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>
                            {isRTL ? 'جاهز للاستلام' : 'Ready for Collection'}
                          </StepLabel>
                        </Step>
                      </Stepper>

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'تاريخ التقديم' : 'Submitted'}: {app.submittedDate}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: app.color }}>
                            {isRTL ? 'المتوقع' : 'Expected'}: {app.expectedDate}
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

          {/* Embassy Directory Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'السفارات السودانية حول العالم' : 'Sudanese Embassies Worldwide'}
              </Typography>

              <Grid container spacing={3}>
                {embassies.map((embassy, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${embassy.color}20`,
                        '&:hover': {
                          borderColor: embassy.color,
                          boxShadow: `0 4px 12px ${embassy.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${embassy.color}15`,
                            color: embassy.color,
                          }}
                        >
                          <LocationOn sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {embassy.country}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {embassy.city}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'العنوان' : 'Address'}
                            secondary={embassy.address}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الهاتف' : 'Phone'}
                            secondary={embassy.phone}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'البريد الإلكتروني' : 'Email'}
                            secondary={embassy.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'ساعات العمل' : 'Hours'}
                            secondary={embassy.hours}
                          />
                        </ListItem>
                      </List>

                      <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                        {embassy.services.map((service, i) => (
                          <Chip
                            key={i}
                            label={service}
                            size="small"
                            sx={{
                              bgcolor: `${embassy.color}15`,
                              color: embassy.color,
                              fontWeight: 600,
                            }}
                          />
                        ))}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Travel Advisories Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'تنبيهات وتحذيرات السفر' : 'Travel Warnings & Advisories'}
              </Typography>

              <Grid container spacing={3}>
                {travelAdvisories.map((advisory, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${advisory.color}`,
                        background: `linear-gradient(135deg, ${advisory.color}05 0%, #ffffff 100%)`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {advisory.country}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isRTL ? 'محدث' : 'Updated'}: {advisory.updated}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<Warning />}
                          label={advisory.level}
                          sx={{
                            bgcolor: advisory.color,
                            color: 'white',
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: advisory.color }} gutterBottom>
                        {advisory.advisory}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {advisory.details}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Documents Tab */}
          {currentTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'المستندات الصادرة' : 'Issued Documents'}
              </Typography>

              <Grid container spacing={3}>
                {issuedDocuments.map((doc, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${doc.color}20`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {doc.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doc.number}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<CheckCircle />}
                          label={doc.status}
                          color="success"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {doc.issueDate}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {doc.expiryDate}
                        </Typography>
                      </Box>
                      <Button fullWidth variant="outlined" startIcon={<Download />}>
                        {isRTL ? 'تنزيل' : 'Download'}
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
