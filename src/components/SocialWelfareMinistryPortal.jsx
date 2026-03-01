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
  VolunteerActivism,
  FamilyRestroom,
  Elderly,
  ChildCare,
  LocalHospital,
  Home,
  AttachMoney,
  Description,
  CheckCircle,
  Pending,
  Download,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function SocialWelfareMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const welfareStats = {
    activeBenefits: 3,
    monthlySupport: 2500,
    applicationsPending: 1,
    programsEnrolled: 2,
  };

  const myBenefits = [
    {
      id: 'FAM-2026-001',
      program: 'Family Support Allowance',
      amount: 1500,
      status: 'Active',
      nextPayment: '2026-03-05',
      frequency: 'Monthly',
      color: '#16a34a',
    },
    {
      id: 'DIS-2026-045',
      program: 'Disability Support',
      amount: 1000,
      status: 'Active',
      nextPayment: '2026-03-05',
      frequency: 'Monthly',
      color: '#2563eb',
    },
    {
      id: 'ELD-2025-234',
      program: 'Elderly Care Assistance',
      amount: 800,
      status: 'Under Review',
      submittedDate: '2026-02-20',
      frequency: 'Monthly',
      color: '#ea580c',
    },
  ];

  const availablePrograms = [
    {
      name: 'Orphan Care Program',
      description: 'Financial and educational support for orphaned children',
      eligibility: 'Children under 18 who lost both parents',
      benefit: '2,000 SDG/month + education fees',
      enrolled: 12450,
      color: '#7c3aed',
    },
    {
      name: 'Widow Support Initiative',
      description: 'Economic empowerment for widows',
      eligibility: 'Widowed women with dependents',
      benefit: '1,500 SDG/month + vocational training',
      enrolled: 8920,
      color: '#ec4899',
    },
    {
      name: 'Emergency Relief Fund',
      description: 'Temporary assistance during crises',
      eligibility: 'Families affected by natural disasters',
      benefit: 'Up to 5,000 SDG one-time',
      enrolled: 3240,
      color: '#dc2626',
    },
  ];

  const services = [
    {
      title: isRTL ? 'مزايا الأسرة' : 'Family Benefits',
      description: isRTL
        ? 'الدعم المالي الشهري للأسر'
        : 'Monthly financial support for families',
      icon: FamilyRestroom,
      color: '#16a34a',
      featured: true,
      stats: [
        { value: `${welfareStats.monthlySupport} SDG`, label: isRTL ? 'شهرياً' : 'Monthly' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض المزايا' : 'View Benefits',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'دعم الإعاقة' : 'Disability Support',
      description: isRTL
        ? 'خدمات ومساعدات لذوي الاحتياجات الخاصة'
        : 'Services and assistance for people with disabilities',
      icon: LocalHospital,
      color: '#2563eb',
      featured: true,
      badge: isRTL ? 'نشط' : 'Active',
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'رعاية المسنين' : 'Elderly Care',
      description: isRTL
        ? 'برامج دعم ورعاية كبار السن'
        : 'Support programs for senior citizens',
      icon: Elderly,
      color: '#ea580c',
      stats: [
        { value: welfareStats.activeBenefits, label: isRTL ? 'نشط' : 'Active' },
      ],
      actions: [
        {
          label: isRTL ? 'التفاصيل' : 'Details',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'رعاية الأيتام' : 'Orphan Care',
      description: isRTL
        ? 'الدعم التعليمي والمالي للأيتام'
        : 'Educational and financial support for orphans',
      icon: ChildCare,
      color: '#7c3aed',
      badge: isRTL ? '12.4k مسجل' : '12.4k Enrolled',
      actions: [
        {
          label: isRTL ? 'معرفة المزيد' : 'Learn More',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'الإسكان الاجتماعي' : 'Social Housing',
      description: isRTL
        ? 'برامج الإسكان للأسر المحتاجة'
        : 'Housing programs for low-income families',
      icon: Home,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'تقديم طلب' : 'Apply',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'صندوق الطوارئ' : 'Emergency Fund',
      description: isRTL
        ? 'المساعدة الفورية في الأزمات'
        : 'Immediate assistance during crises',
      icon: AttachMoney,
      color: '#dc2626',
      badge: isRTL ? 'متاح 24/7' : 'Available 24/7',
      actions: [
        {
          label: isRTL ? 'طلب مساعدة' : 'Request Help',
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
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <VolunteerActivism sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'الشؤون الاجتماعية' : 'Social Welfare'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'الدعم والرعاية الاجتماعية' : 'Support & Care Services'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.8"
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
                  title={isRTL ? 'مزايا نشطة' : 'Active Benefits'}
                  value={welfareStats.activeBenefits}
                  icon={CheckCircle}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'دعم شهري' : 'Monthly Support'}
                  value={welfareStats.monthlySupport}
                  subtitle="SDG"
                  icon={AttachMoney}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'قيد المراجعة' : 'Pending'}
                  value={welfareStats.applicationsPending}
                  icon={Pending}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'برامج مسجلة' : 'Enrolled'}
                  value={welfareStats.programsEnrolled}
                  icon={FamilyRestroom}
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
            startIcon={<FamilyRestroom />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'مزاياي' : 'My Benefits'}
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
            {isRTL ? 'تقديم طلب' : 'Apply'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<AttachMoney />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'المدفوعات' : 'Payments'}
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
          <Tab label={isRTL ? 'مزاياي' : 'My Benefits'} />
          <Tab label={isRTL ? 'البرامج المتاحة' : 'Available Programs'} />
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

          {/* My Benefits Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'المزايا النشطة والمعلقة' : 'Active & Pending Benefits'}
              </Typography>

              <Grid container spacing={3}>
                {myBenefits.map((benefit, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${benefit.color}30`,
                        '&:hover': {
                          borderColor: benefit.color,
                          boxShadow: `0 4px 12px ${benefit.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {benefit.program}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {benefit.id} • {benefit.frequency}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              label={benefit.status}
                              size="small"
                              color={benefit.status === 'Active' ? 'success' : 'warning'}
                              sx={{ fontWeight: 600 }}
                            />
                            {benefit.nextPayment && (
                              <Chip
                                label={`${isRTL ? 'الدفع القادم' : 'Next Payment'}: ${benefit.nextPayment}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h4" sx={{ fontWeight: 800, color: benefit.color }}>
                            {benefit.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SDG/{benefit.frequency === 'Monthly' ? (isRTL ? 'شهر' : 'month') : (isRTL ? 'مرة واحدة' : 'one-time')}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Available Programs Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'برامج الدعم الاجتماعي' : 'Social Support Programs'}
              </Typography>

              <Grid container spacing={3}>
                {availablePrograms.map((program, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${program.color}20`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: program.color }} gutterBottom>
                        {program.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {program.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'الأهلية' : 'Eligibility'}
                            secondary={program.eligibility}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={isRTL ? 'المزايا' : 'Benefits'}
                            secondary={program.benefit}
                          />
                        </ListItem>
                      </List>
                      <Chip
                        label={`${program.enrolled.toLocaleString()} ${isRTL ? 'مستفيد' : 'beneficiaries'}`}
                        size="small"
                        sx={{
                          my: 2,
                          bgcolor: `${program.color}15`,
                          color: program.color,
                          fontWeight: 600,
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 'auto', bgcolor: program.color }}
                      >
                        {isRTL ? 'تقديم طلب' : 'Apply Now'}
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
