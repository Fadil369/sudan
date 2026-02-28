import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  Fingerprint,
  Badge as BadgeIcon,
  FamilyRestroom,
  Assignment,
  CheckCircle,
  Search,
  Download,
  PersonAdd,
  Verified,
  Warning,
  Phone,
  LocalHospital,
  Security
} from '@mui/icons-material';

const IdentityMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';

  const [searchNID, setSearchNID] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);

  const t = {
    en: {
      title: 'Citizen Identity & Civil Registry',
      subtitle: 'National Identity Management System — OID: 1.3.6.1.4.1.61026.2',
      searchLabel: 'Search by National ID Number',
      searchBtn: 'Search Registry',
      services: 'Available Services',
      stats: 'Registry Statistics',
      emergency: 'Emergency Contacts',
      registered: 'Registered Citizens',
      pending: 'Pending Applications',
      verified: 'Verified IDs',
      serviceItems: [
        { id: 'digital_id', icon: <BadgeIcon />, label: 'Digital ID Registration', desc: 'Apply for or renew your national digital identity card', color: '#0ea5e9' },
        { id: 'birth_cert', icon: <FamilyRestroom />, label: 'Birth Certificates', desc: 'Register births and obtain certified birth certificates', color: '#10b981' },
        { id: 'death_cert', icon: <Assignment />, label: 'Death Certificates', desc: 'Register deaths and obtain certified death certificates', color: '#6366f1' },
        { id: 'marriage', icon: <Verified />, label: 'Marriage Registration', desc: 'Register marriages and obtain marriage certificates', color: '#f59e0b' },
        { id: 'biometric', icon: <Fingerprint />, label: 'Biometric Enrollment', desc: 'Enroll fingerprints and biometric data for secure ID', color: '#ec4899' },
        { id: 'address', icon: <CheckCircle />, label: 'Address Update', desc: 'Update your registered address in the national registry', color: '#22c55e' },
      ],
      emergencyNumbers: [
        { label: 'Police', number: '999', icon: <Security /> },
        { label: 'Ambulance', number: '998', icon: <LocalHospital /> },
        { label: 'Civil Registry Hotline', number: '0155-000-1001', icon: <Phone /> },
      ],
      searchPlaceholder: 'e.g. 102-456-789',
      applyNow: 'Apply Now',
      download: 'Download Form',
      notFound: 'No record found for this ID number.',
      found: 'Record found',
      close: 'Close',
      contactHotline: 'Contact Civil Registry Hotline',
    },
    ar: {
      title: 'هوية المواطن وسجل الأحوال المدنية',
      subtitle: 'نظام إدارة الهوية الوطنية — OID: 1.3.6.1.4.1.61026.2',
      searchLabel: 'البحث برقم الهوية الوطنية',
      searchBtn: 'بحث في السجل',
      services: 'الخدمات المتاحة',
      stats: 'إحصاءات السجل',
      emergency: 'أرقام الطوارئ',
      registered: 'مواطن مسجل',
      pending: 'طلب معلق',
      verified: 'هوية موثقة',
      serviceItems: [
        { id: 'digital_id', icon: <BadgeIcon />, label: 'تسجيل الهوية الرقمية', desc: 'تقديم طلب أو تجديد بطاقة هويتك الوطنية الرقمية', color: '#0ea5e9' },
        { id: 'birth_cert', icon: <FamilyRestroom />, label: 'شهادات الميلاد', desc: 'تسجيل المواليد والحصول على شهادات ميلاد معتمدة', color: '#10b981' },
        { id: 'death_cert', icon: <Assignment />, label: 'شهادات الوفاة', desc: 'تسجيل الوفيات والحصول على شهادات وفاة معتمدة', color: '#6366f1' },
        { id: 'marriage', icon: <Verified />, label: 'تسجيل الزواج', desc: 'تسجيل عقود الزواج والحصول على وثائق الزواج', color: '#f59e0b' },
        { id: 'biometric', icon: <Fingerprint />, label: 'التسجيل البيومتري', desc: 'تسجيل بصمات الأصابع والبيانات الحيوية للهوية الآمنة', color: '#ec4899' },
        { id: 'address', icon: <CheckCircle />, label: 'تحديث العنوان', desc: 'تحديث عنوانك المسجل في السجل الوطني', color: '#22c55e' },
      ],
      emergencyNumbers: [
        { label: 'الشرطة', number: '999', icon: <Security /> },
        { label: 'الإسعاف', number: '998', icon: <LocalHospital /> },
        { label: 'خط ساخن للأحوال المدنية', number: '0155-000-1001', icon: <Phone /> },
      ],
      searchPlaceholder: 'مثال: 102-456-789',
      applyNow: 'تقديم الطلب الآن',
      download: 'تنزيل النموذج',
      notFound: 'لم يتم العثور على سجل لرقم الهوية هذا.',
      found: 'تم العثور على السجل',
      close: 'إغلاق',
      contactHotline: 'اتصل بالخط الساخن للأحوال المدنية',
    },
  };

  const txt = t[language] || t.en;

  const handleSearch = () => {
    if (!searchNID.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);

    // Simulate API call with realistic delay
    setTimeout(() => {
      setSearchLoading(false);
      if (searchNID.length >= 6) {
        setSearchResult({
          found: true,
          name: isRTL ? 'أحمد محمد عبدالله' : 'Ahmed Mohamed Abdullah',
          nid: searchNID,
          status: isRTL ? 'موثق' : 'Verified',
          dob: '1985-03-15',
          state: isRTL ? 'الخرطوم' : 'Khartoum',
        });
      } else {
        setSearchResult({ found: false });
      }
    }, 1200);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setServiceDialogOpen(true);
  };

  const handleServiceApply = () => {
    setServiceDialogOpen(false);
    setSnackbarMessage(
      isRTL
        ? `تم استلام طلبك لخدمة "${selectedService?.label}". سيتم التواصل معك خلال 3-5 أيام عمل.`
        : `Your application for "${selectedService?.label}" has been received. You will be contacted within 3-5 business days.`
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, mb: 1 }}>
          {txt.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
          {txt.subtitle}
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: txt.registered, value: '42,156,890', color: '#0ea5e9', progress: 93 },
          { label: txt.verified, value: '38,902,445', color: '#10b981', progress: 85 },
          { label: txt.pending, value: '14,230', color: '#f59e0b', progress: 12 },
        ].map((stat) => (
          <Grid item xs={12} md={4} key={stat.label}>
            <Card sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  {stat.label}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stat.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { backgroundColor: stat.color }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ID Search */}
      <Card sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', mb: 2 }}>
            {txt.searchLabel}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder={txt.searchPlaceholder}
              value={searchNID}
              onChange={(e) => setSearchNID(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                },
                '& input': { color: 'rgba(255,255,255,0.9)' }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={searchLoading}
              sx={{ minHeight: 44 }}
            >
              {txt.searchBtn}
            </Button>
          </Box>

          {searchLoading && <LinearProgress sx={{ mt: 2 }} />}

          {searchResult && (
            <Box sx={{ mt: 2 }}>
              {searchResult.found ? (
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {txt.found}: {searchResult.name}
                  </Typography>
                  <Typography variant="body2">
                    NID: {searchResult.nid} | {isRTL ? 'الولاية' : 'State'}: {searchResult.state} |{' '}
                    <Chip label={searchResult.status} size="small" color="success" sx={{ ml: 0.5 }} />
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" icon={<Warning />}>
                  {txt.notFound}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Services Grid */}
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', mb: 2, fontWeight: 600 }}>
        {txt.services}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {txt.serviceItems.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${service.color}15 0%, ${service.color}05 100%)`,
                border: `1px solid ${service.color}30`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: service.color,
                  boxShadow: `0 8px 24px ${service.color}25`,
                }
              }}
              onClick={() => handleServiceClick(service)}
            >
              <CardContent>
                <Box sx={{ color: service.color, mb: 1 }}>{service.icon}</Box>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>
                  {service.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                  {service.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Emergency Section */}
      <Paper
        sx={{
          p: 3,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 2
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 700, mb: 1 }}>
              🚨 {txt.emergency}
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {txt.emergencyNumbers.map((e) => (
                <Chip
                  key={e.number}
                  icon={e.icon}
                  label={`${e.label}: ${e.number}`}
                  sx={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Phone />}
            onClick={() => setEmergencyDialogOpen(true)}
            sx={{ minHeight: 44 }}
          >
            {txt.contactHotline}
          </Button>
        </Box>
      </Paper>

      {/* Service Application Dialog */}
      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedService?.label}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedService?.desc}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {isRTL
              ? 'ستحتاج إلى إحضار: بطاقة الهوية الوطنية الحالية، صورة شخصية حديثة، وأي وثائق داعمة ذات صلة.'
              : 'You will need to bring: Current national ID card, a recent passport photo, and any relevant supporting documents.'}
          </Typography>
          <List dense>
            {[
              isRTL ? 'بطاقة هوية سارية المفعول' : 'Valid identification card',
              isRTL ? 'دليل الإقامة' : 'Proof of residence',
              isRTL ? 'صورة شخصية (4×6 سم)' : 'Passport photo (4×6 cm)',
            ].map((item, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>{txt.close}</Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {
              setServiceDialogOpen(false);
              setSnackbarMessage(isRTL ? 'جار تنزيل النموذج...' : 'Downloading form...');
              setSnackbarSeverity('info');
              setSnackbarOpen(true);
            }}
          >
            {txt.download}
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleServiceApply}
          >
            {txt.applyNow}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={emergencyDialogOpen} onClose={() => setEmergencyDialogOpen(false)}>
        <DialogTitle sx={{ color: '#ef4444' }}>
          🚨 {txt.emergency}
        </DialogTitle>
        <DialogContent>
          <List>
            {txt.emergencyNumbers.map((e) => (
              <ListItem key={e.number}>
                <ListItemIcon sx={{ color: '#ef4444' }}>{e.icon}</ListItemIcon>
                <ListItemText
                  primary={e.label}
                  secondary={e.number}
                  secondaryTypographyProps={{ sx: { fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' } }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmergencyDialogOpen(false)}>{txt.close}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IdentityMinistryPortal;
