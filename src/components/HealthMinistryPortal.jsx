import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  LocalHospital,
  CalendarMonth,
  Medication,
  Description,
  Vaccines,
  MonitorHeart,
  Psychology,
  ChildCare,
  AccessibleForward,
  Add,
  VideoCall,
  Download,
  Share,
  Star,
  Verified,
  LocalHospital as Emergency,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function HealthMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);
  const [appointmentDialog, setAppointmentDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Mock data
  const healthStats = {
    appointments: { count: 3, next: 'Tomorrow, 10:00 AM' },
    prescriptions: { active: 2, refills: 1 },
    vaccinations: { completed: 12, upcoming: 1 },
    healthScore: 87,
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Ahmed Hassan',
      specialty: 'General Practitioner',
      date: '2026-03-02',
      time: '10:00 AM',
      type: 'In-person',
      location: 'Khartoum Medical Center',
      avatar: '👨‍⚕️',
    },
    {
      id: 2,
      doctor: 'Dr. Fatima Ali',
      specialty: 'Cardiologist',
      date: '2026-03-05',
      time: '2:30 PM',
      type: 'Telemedicine',
      location: 'Video Consultation',
      avatar: '👩‍⚕️',
    },
  ];

  const activePrescriptions = [
    {
      id: 1,
      medication: 'Metformin 500mg',
      dosage: 'Twice daily with meals',
      prescribed: '2026-02-15',
      expires: '2026-05-15',
      refills: 2,
      prescriber: 'Dr. Ahmed Hassan',
    },
    {
      id: 2,
      medication: 'Atorvastatin 20mg',
      dosage: 'Once daily at bedtime',
      prescribed: '2026-01-20',
      expires: '2026-04-20',
      refills: 1,
      prescriber: 'Dr. Fatima Ali',
    },
  ];

  const medicalHistory = [
    {
      date: '2026-02-15',
      type: 'General Checkup',
      doctor: 'Dr. Ahmed Hassan',
      diagnosis: 'Routine physical examination - All normal',
      files: 2,
    },
    {
      date: '2026-01-20',
      type: 'Cardiology Consultation',
      doctor: 'Dr. Fatima Ali',
      diagnosis: 'Blood pressure management - Medication adjusted',
      files: 3,
    },
  ];

  const services = [
    {
      title: isRTL ? 'حجز موعد' : 'Book Appointment',
      description: isRTL
        ? 'احجز موعدًا مع طبيب متخصص في أي مستشفى حكومي'
        : 'Schedule an appointment with a specialist at any government hospital',
      icon: CalendarMonth,
      color: '#2563eb',
      badge: isRTL ? '3 مواعيد قادمة' : '3 Upcoming',
      featured: true,
      stats: [
        { value: '150+', label: isRTL ? 'طبيب' : 'Doctors' },
        { value: '48h', label: isRTL ? 'متوسط الانتظار' : 'Avg. Wait' },
      ],
      actions: [
        {
          label: isRTL ? 'حجز موعد' : 'Book Now',
          onClick: () => setAppointmentDialog(true),
        },
      ],
    },
    {
      title: isRTL ? 'السجل الطبي' : 'Medical Records',
      description: isRTL
        ? 'الوصول إلى سجلاتك الطبية الكاملة ونتائج الفحوصات'
        : 'Access your complete medical history and test results',
      icon: Description,
      color: '#16a34a',
      stats: [
        { value: '24', label: isRTL ? 'سجل' : 'Records' },
        { value: '12', label: isRTL ? 'مختبر' : 'Lab Tests' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض السجلات' : 'View Records',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'الوصفات الطبية' : 'Prescriptions',
      description: isRTL
        ? 'إدارة الأدوية وإعادة الصرف الإلكتروني'
        : 'Manage medications and request electronic refills',
      icon: Medication,
      color: '#dc2626',
      badge: isRTL ? '2 نشطة' : '2 Active',
      stats: [
        { value: '2', label: isRTL ? 'نشطة' : 'Active' },
        { value: '3', label: isRTL ? 'تجديد متاح' : 'Refills' },
      ],
      actions: [
        {
          label: isRTL ? 'إدارة الأدوية' : 'Manage',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'التطعيمات' : 'Vaccinations',
      description: isRTL
        ? 'تتبع سجل التطعيمات وحجز مواعيد جديدة'
        : 'Track vaccination records and schedule new shots',
      icon: Vaccines,
      color: '#7c3aed',
      featured: true,
      stats: [
        { value: '12/13', label: isRTL ? 'مكتمل' : 'Complete' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض السجل' : 'View Record',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الاستشارة عن بعد' : 'Telemedicine',
      description: isRTL
        ? 'استشارات طبية عبر الفيديو من منزلك'
        : 'Video consultations with doctors from home',
      icon: VideoCall,
      color: '#0891b2',
      badge: isRTL ? 'جديد' : 'New',
      actions: [
        {
          label: isRTL ? 'بدء استشارة' : 'Start Call',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الطوارئ' : 'Emergency Services',
      description: isRTL
        ? 'الوصول السريع لخدمات الطوارئ والإسعاف'
        : 'Quick access to emergency and ambulance services',
      icon: Emergency,
      color: '#ea580c',
      actions: [
        {
          label: isRTL ? 'اتصال طوارئ' : 'Emergency Call',
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <LocalHospital sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة الصحة' : 'Ministry of Health'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL
                    ? 'منصة الخدمات الصحية الرقمية'
                    : 'Digital Healthcare Services Platform'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.2"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PremiumStatsCard
              title={isRTL ? 'درجة الصحة' : 'Health Score'}
              value={healthStats.healthScore}
              subtitle={isRTL ? 'ممتاز' : 'Excellent'}
              icon={MonitorHeart}
              color="#16a34a"
              variant="gradient"
              trend={{ value: '+5%', direction: 'up' }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <PremiumStatsCard
            title={isRTL ? 'المواعيد القادمة' : 'Upcoming Appointments'}
            value={healthStats.appointments.count}
            subtitle={healthStats.appointments.next}
            icon={CalendarMonth}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PremiumStatsCard
            title={isRTL ? 'الوصفات النشطة' : 'Active Prescriptions'}
            value={healthStats.prescriptions.active}
            subtitle={`${healthStats.prescriptions.refills} ${isRTL ? 'تجديد متاح' : 'refills available'}`}
            icon={Medication}
            color="#dc2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PremiumStatsCard
            title={isRTL ? 'التطعيمات' : 'Vaccinations'}
            value={`${healthStats.vaccinations.completed}/13`}
            subtitle={`${healthStats.vaccinations.upcoming} ${isRTL ? 'قادم' : 'upcoming'}`}
            icon={Vaccines}
            color="#7c3aed"
            progress={{ value: (healthStats.vaccinations.completed / 13) * 100, label: 'Progress' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<Emergency />}
            sx={{
              height: '100%',
              minHeight: 120,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
              fontSize: '1.1rem',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
            }}
          >
            {isRTL ? 'اتصال طوارئ' : 'Emergency Call'}
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
          <Tab label={isRTL ? 'الوصفات' : 'Prescriptions'} />
          <Tab label={isRTL ? 'السجل الطبي' : 'Medical History'} />
          <Tab label={isRTL ? 'المواعيد' : 'Appointments'} />
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

          {/* Prescriptions Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'الوصفات النشطة' : 'Active Prescriptions'}
                </Typography>
                <Button variant="outlined" startIcon={<Add />}>
                  {isRTL ? 'طلب تجديد' : 'Request Refill'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {activePrescriptions.map((rx) => (
                  <Grid item xs={12} key={rx.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                            {rx.medication}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {rx.dosage}
                          </Typography>
                          <Box display="flex" gap={1} mt={2}>
                            <Chip size="small" label={`${rx.refills} refills left`} />
                            <Chip size="small" label={`Expires ${rx.expires}`} color="warning" />
                          </Box>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton><Download /></IconButton>
                          <IconButton><Share /></IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Medical History Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'السجل الطبي' : 'Medical History'}
              </Typography>

              <List>
                {medicalHistory.map((record, idx) => (
                  <Box key={idx}>
                    <ListItem
                      sx={{
                        bgcolor: '#f9fafb',
                        borderRadius: 2,
                        mb: 2,
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#2563eb' }}>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {record.type}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {record.doctor} • {record.date}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {record.diagnosis}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip label={`${record.files} files`} size="small" />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Box>
          )}

          {/* Appointments Tab */}
          {currentTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'المواعيد القادمة' : 'Upcoming Appointments'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAppointmentDialog(true)}
                >
                  {isRTL ? 'حجز موعد' : 'Book Appointment'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {upcomingAppointments.map((apt) => (
                  <Grid item xs={12} md={6} key={apt.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #e5e7eb',
                        '&:hover': {
                          borderColor: '#2563eb',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
                        },
                      }}
                    >
                      <Box display="flex" gap={2}>
                        <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
                          {apt.avatar}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {apt.doctor}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {apt.specialty}
                          </Typography>
                          <Divider sx={{ my: 1.5 }} />
                          <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2">
                              📅 {apt.date}
                            </Typography>
                            <Typography variant="body2">
                              🕐 {apt.time}
                            </Typography>
                          </Box>
                          <Chip
                            label={apt.type}
                            size="small"
                            color={apt.type === 'Telemedicine' ? 'primary' : 'default'}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Appointment Dialog */}
      <Dialog
        open={appointmentDialog}
        onClose={() => setAppointmentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isRTL ? 'حجز موعد جديد' : 'Book New Appointment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={isRTL ? 'التخصص' : 'Specialty'}
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value="">Select...</option>
            <option value="general">General Practitioner</option>
            <option value="cardio">Cardiologist</option>
            <option value="derma">Dermatologist</option>
          </TextField>
          <TextField
            fullWidth
            label={isRTL ? 'التاريخ المفضل' : 'Preferred Date'}
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={isRTL ? 'نوع الموعد' : 'Appointment Type'}
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value="">Select...</option>
            <option value="in-person">In-Person</option>
            <option value="telemedicine">Telemedicine</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAppointmentDialog(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => setAppointmentDialog(false)}>
            {isRTL ? 'تأكيد الحجز' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
