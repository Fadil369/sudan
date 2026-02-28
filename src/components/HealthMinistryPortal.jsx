import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, TextField,
  Alert, Snackbar, Divider, List, ListItem,
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Tab, Tabs, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Stepper, Step,
  StepLabel, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  LocalHospital, MedicalServices, Vaccines, HealthAndSafety,
  MonitorHeart, CrisisAlert, Person, Phone, VideoCall, Science,
  Medication, FamilyRestroom, CheckCircle, Download, Search,
  CalendarMonth, Warning, Info,
} from '@mui/icons-material';
import { GovStatCard, GovServiceCard, GOV_NAVY, GOV_RED } from './GovCard';

/* Health ministry primary colour and secondary colours */
const H  = '#006B45';   /* health green */
const N  = GOV_NAVY;    /* navy (admin) */
const ER = GOV_RED;     /* emergency red */

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

const HealthMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState(0);
  const [serviceDialog, setServiceDialog] = useState(null);
  const [appointmentStep, setAppointmentStep] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');
  const [nhifSearch, setNhifSearch] = useState('');
  const [nhifResult, setNhifResult] = useState(null);
  const [aptSpecialty, setAptSpecialty] = useState('');
  const [aptHospital, setAptHospital] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [teleSpecialty, setTeleSpecialty] = useState('');

  const showSnack = (msg, severity = 'success') => { setSnackMsg(msg); setSnackSeverity(severity); setSnackOpen(true); };

  const specialties = ['General Practice', 'Internal Medicine', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Obstetrics & Gynecology', 'Cardiology', 'Diabetology', 'Ophthalmology'];
  const hospitals = ['Khartoum Teaching Hospital', 'Soba University Hospital', 'Ibn Sina Hospital', 'Police Hospital', 'Military Hospital', 'Omdurman Teaching Hospital'];

  const txt = {
    tabs: isRTL ? ['نظرة عامة', 'الخدمات', 'المواعيد', 'الطب عن بُعد', 'السجلات', 'الطوارئ'] : ['Overview', 'Services', 'Appointments', 'Telemedicine', 'Records', 'Emergency'],
    title: isRTL ? 'وزارة الصحة والسكان' : 'Ministry of Health & Population',
    oid: 'OID: 1.3.6.1.4.1.61026.5',
    services: isRTL ? 'الخدمات الصحية' : 'Health Services',
    nhifLabel: isRTL ? 'البحث عن حالة التأمين بالرقم الوطني' : 'Search NHIF Status by National ID',
    nhifBtn: isRTL ? 'تحقق' : 'Check Status',
    vaccineSchedule: isRTL ? 'جدول التطعيمات' : 'Vaccination Schedule',
    diseaseAlert: isRTL ? 'تنبيهات صحية نشطة' : 'Active Health Alerts',
    topSpecialties: isRTL ? 'التخصصات المتاحة إلكترونياً' : 'Available Specialties Online',
    close: isRTL ? 'إغلاق' : 'Close',
    apply: isRTL ? 'تأكيد' : 'Confirm',
    bookAppt: isRTL ? 'احجز الموعد' : 'Book Appointment',
    startConsult: isRTL ? 'ابدأ الاستشارة' : 'Start Consultation',
    download: isRTL ? 'تنزيل النموذج' : 'Download Form',
    specialty: isRTL ? 'التخصص' : 'Specialty',
    hospital: isRTL ? 'المستشفى' : 'Hospital / Facility',
    preferredDate: isRTL ? 'التاريخ المفضل' : 'Preferred Date',
    appointmentSteps: isRTL ? ['اختر المنشأة', 'اختر التاريخ', 'تأكيد'] : ['Select Facility', 'Choose Date', 'Confirm'],
    emergencyNote: isRTL ? 'في الحالات الطارئة، اتصل بـ 999 فوراً أو اذهب لأقرب طوارئ.' : 'For life-threatening emergencies call 999 immediately or go to the nearest ER.',
    emergencyContacts: [
      { label: isRTL ? 'الطوارئ (الإسعاف)' : 'Emergency (Ambulance)', number: '999', icon: <CrisisAlert /> },
      { label: isRTL ? 'الخط الساخن الصحي' : 'Health Hotline', number: '0155-000-1515', icon: <Phone /> },
      { label: isRTL ? 'خط أزمات الصحة النفسية' : 'Mental Health Crisis', number: '0122-880-0800', icon: <MonitorHeart /> },
      { label: isRTL ? 'مكافحة التسمم' : 'Poison Control', number: '0183-770-000', icon: <Warning /> },
      { label: isRTL ? 'خدمة عملاء التأمين' : 'NHIF Customer Service', number: '0122-700-0800', icon: <HealthAndSafety /> },
      { label: isRTL ? 'ترصد الأمراض' : 'Disease Surveillance', number: '0155-000-3344', icon: <Science /> },
    ],
  };

  const serviceItems = [
    { id: 'appointment', icon: <CalendarMonth />, label: isRTL ? 'حجز موعد' : 'Book Hospital Appointment', desc: isRTL ? 'حجز مواعيد في 680+ منشأة معتمدة' : 'Schedule appointments at 680+ accredited facilities', color: H, badge: isRTL ? 'مجاني (NHIF)' : 'Free w/ NHIF', cta: isRTL ? 'احجز' : 'Book Now' },
    { id: 'telemedicine', icon: <VideoCall />, label: isRTL ? 'استشارة عن بُعد' : 'Telemedicine Consultation', desc: isRTL ? 'استشر طبيباً عبر الإنترنت — متوسط انتظار 18 دقيقة' : 'Online doctor consultation — avg. 18 min wait', color: H, badge: isRTL ? 'متاح 24/7' : 'Online 24/7', cta: isRTL ? 'ابدأ' : 'Start' },
    { id: 'nhif_enroll', icon: <HealthAndSafety />, label: isRTL ? 'التسجيل في التأمين الصحي' : 'NHIF Enrollment', desc: isRTL ? 'التسجيل في الصندوق القومي للتأمين الصحي' : 'Enroll in the National Health Insurance Fund', color: N, badge: isRTL ? 'إلزامي 2025' : 'Mandatory 2025', cta: isRTL ? 'سجّل' : 'Enroll' },
    { id: 'vaccine', icon: <Vaccines />, label: isRTL ? 'حجز تطعيم' : 'Vaccination Appointment', desc: isRTL ? 'مواعيد تطعيم للأطفال والبالغين' : 'EPI vaccines for children and adults (COVID, Flu, YF)', color: H, badge: isRTL ? 'مجاني' : 'Free', cta: isRTL ? 'احجز' : 'Book' },
    { id: 'records', icon: <MedicalServices />, label: isRTL ? 'السجلات الطبية' : 'Medical Records Request', desc: isRTL ? 'طلب نسخ معتمدة من التاريخ الطبي ونتائج المختبر' : 'Request certified medical records, discharge summaries, lab results', color: N, cta: isRTL ? 'اطلب' : 'Request' },
    { id: 'lab', icon: <Science />, label: isRTL ? 'المختبرات والتشخيص' : 'Laboratory & Diagnostics', desc: isRTL ? 'حجز الفحوصات المخبرية والتصوير الطبي' : 'Book blood tests, PCR, imaging at public health labs', color: H, cta: isRTL ? 'احجز' : 'Book Test' },
    { id: 'medicine', icon: <Medication />, label: isRTL ? 'الأدوية الأساسية' : 'Essential Medicines', desc: isRTL ? 'التحقق من توافر الأدوية المدعومة' : 'Check subsidized medicine availability at nearby pharmacies', color: H, cta: isRTL ? 'تحقق' : 'Check' },
    { id: 'maternal', icon: <FamilyRestroom />, label: isRTL ? 'صحة الأم والطفل' : 'Maternal & Child Health', desc: isRTL ? 'التسجيل للرعاية السابقة للولادة والولادة الآمنة' : 'Antenatal care, safe delivery, and postnatal follow-up', color: H, cta: isRTL ? 'سجّل' : 'Register' },
    { id: 'mental', icon: <MonitorHeart />, label: isRTL ? 'الصحة النفسية' : 'Mental Health Services', desc: isRTL ? 'إرشاد نفسي وبرامج إعادة التأهيل' : 'Counselling, psychiatric consultations, rehabilitation', color: N, cta: isRTL ? 'احصل على الدعم' : 'Get Support' },
    { id: 'chronic', icon: <MedicalServices />, label: isRTL ? 'إدارة الأمراض المزمنة' : 'Chronic Disease Management', desc: isRTL ? 'إدارة السكري وارتفاع الضغط والربو' : 'Care plans for diabetes, hypertension, asthma, and more', color: H, cta: isRTL ? 'التسجيل' : 'Enroll' },
    { id: 'emergency_ref', icon: <CrisisAlert />, label: isRTL ? 'الإحالة الطارئة' : 'Emergency Referral', desc: isRTL ? 'خطاب إحالة ذو أولوية إلى مستشفيات الرعاية الثالثية' : 'Priority referral letters to tertiary hospitals', color: ER, badge: isRTL ? 'طارئ' : 'Urgent', cta: isRTL ? 'احصل على إحالة' : 'Get Referral' },
    { id: 'organ', icon: <LocalHospital />, label: isRTL ? 'التبرع بالأعضاء' : 'Organ Donor Registration', desc: isRTL ? 'التسجيل كمتبرع بالأعضاء واستلام البطاقة' : 'Register as an organ donor and receive your donor card', color: N, cta: isRTL ? 'سجّل' : 'Register' },
  ];

  const overviewStats = [
    { value: '735', label: isRTL ? 'المستشفيات والمرافق' : 'Hospitals & Facilities', color: H, progress: 78, icon: <LocalHospital /> },
    { value: '37,500', label: isRTL ? 'الأسرة الطبية' : 'Hospital Beds', color: H, progress: 62, icon: <MedicalServices /> },
    { value: '18,500', label: isRTL ? 'الأطباء المسجلون' : 'Registered Doctors', color: H, progress: 44, icon: <Person /> },
    { value: '38,400', label: isRTL ? 'الطاقم التمريضي' : 'Nursing Staff', color: N, progress: 65, icon: <HealthAndSafety /> },
    { value: '12M+', label: isRTL ? 'مشتركو التأمين الصحي' : 'NHIF Enrollees', color: N, progress: 28, icon: <HealthAndSafety /> },
    { value: '28.5%', label: isRTL ? 'التغطية الصحية' : 'Health Coverage', color: H, progress: 29, icon: <MonitorHeart /> },
    { value: '5,840', label: isRTL ? 'وحدات الرعاية الأولية' : 'PHC Units', color: H, progress: 82, icon: <LocalHospital /> },
    { value: '285K', label: isRTL ? 'استشارات طبية عن بُعد' : 'Teleconsultations (2024)', color: H, progress: 71, icon: <VideoCall /> },
  ];

  const diseaseAlerts = [
    { disease: 'Malaria', region: isRTL ? 'جميع الولايات' : 'All States', status: 'endemic', color: H },
    { disease: 'Dengue Fever', region: isRTL ? 'البحر الأحمر، كسلا' : 'Red Sea, Kassala', status: 'outbreak', color: ER },
    { disease: 'Cholera', region: isRTL ? 'دارفور، كردفان' : 'Darfur, Kordofan', status: 'alert', color: H },
    { disease: 'Tuberculosis', region: isRTL ? 'على المستوى الوطني' : 'Nationwide', status: 'endemic', color: H },
    { disease: 'Leishmaniasis', region: isRTL ? 'القضارف، النيل الأزرق' : 'Gedaref, Blue Nile', status: 'endemic', color: H },
  ];

  const vaccineRows = [
    { vaccine: 'BCG + OPV0', when: isRTL ? 'عند الولادة' : 'At birth' },
    { vaccine: 'OPV1 + DTP-HepB-Hib1 + PCV1 + RV1', when: isRTL ? '6 أسابيع' : '6 weeks' },
    { vaccine: 'OPV2 + DTP-HepB-Hib2 + PCV2 + RV2', when: isRTL ? '10 أسابيع' : '10 weeks' },
    { vaccine: 'OPV3 + DTP-HepB-Hib3 + PCV3', when: isRTL ? '14 أسبوعاً' : '14 weeks' },
    { vaccine: 'Measles-Rubella 1 + Yellow Fever', when: isRTL ? '9 أشهر' : '9 months' },
    { vaccine: 'Measles-Rubella 2 + OPV Booster', when: isRTL ? '18 شهراً' : '18 months' },
    { vaccine: 'HPV (dose 1)', when: isRTL ? '9-14 سنوات (بنات)' : '9-14 yrs (girls)' },
  ];

  const handleNhifSearch = () => {
    if (!nhifSearch.trim()) return;
    setTimeout(() => {
      setNhifResult({ found: true, memberId: `NHIF-${nhifSearch.replace(/-/g, '')}`, status: 'active', plan: isRTL ? 'موظف حكومي' : 'Government Employee', expiryDate: '2025-12-31', facilities: 680 });
    }, 700);
  };

  const handleBookAppointment = () => {
    if (appointmentStep < 2) { setAppointmentStep(s => s + 1); return; }
    setServiceDialog(null); setAppointmentStep(0);
    showSnack(isRTL ? `تم حجز الموعد! APT-${Date.now().toString().slice(-6)}` : `Appointment booked! Ref: APT-${Date.now().toString().slice(-6)}`);
  };

  const renderDialogContent = (service) => {
    if (!service) return null;
    if (service.id === 'appointment') {
      return (
        <Box>
          <Stepper activeStep={appointmentStep} sx={{ mb: 3 }}>{txt.appointmentSteps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}</Stepper>
          {appointmentStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth><InputLabel>{txt.specialty}</InputLabel>
                  <Select value={aptSpecialty} label={txt.specialty} onChange={e => setAptSpecialty(e.target.value)}>
                    {specialties.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth><InputLabel>{txt.hospital}</InputLabel>
                  <Select value={aptHospital} label={txt.hospital} onChange={e => setAptHospital(e.target.value)}>
                    {hospitals.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          {appointmentStep === 1 && (
            <TextField fullWidth type="date" label={txt.preferredDate} value={aptDate} onChange={e => setAptDate(e.target.value)}
              InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().slice(0, 10) }} />
          )}
          {appointmentStep === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>{isRTL ? 'مراجعة تفاصيل الموعد' : 'Review Appointment Details'}</Alert>
              <List dense>
                {[[txt.specialty, aptSpecialty || '—'], [txt.hospital, aptHospital || '—'], [txt.preferredDate, aptDate || '—']].map(([k, v]) => (
                  <ListItem key={k} disablePadding sx={{ mb: 0.5 }}><ListItemText primary={<><strong>{k}:</strong> {v}</>} /></ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      );
    }
    if (service.id === 'nhif_enroll') {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>{isRTL ? 'تأمين شامل: عيادات، طوارئ، دخول، جراحات، أدوية، أمومة.' : 'Comprehensive coverage: outpatient, emergency, inpatient, surgery, medicines, maternity.'}</Alert>
          <List dense>
            {[isRTL ? 'هوية وطنية سارية' : 'Valid national ID', isRTL ? 'صورة شخصية' : 'Passport photo', isRTL ? 'إثبات الوظيفة' : 'Employment proof', isRTL ? 'شهادات الميلاد للمعالين' : 'Birth certs for dependants'].map((item, i) => (
              <ListItem key={i}><ListItemIcon sx={{ minWidth: 28 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
            ))}
          </List>
        </Box>
      );
    }
    return (
      <Box>
        <Typography sx={{ mb: 2 }}>{service.desc}</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>{isRTL ? 'المستندات المطلوبة:' : 'Required documents:'}</Alert>
        <List dense>
          {[isRTL ? 'بطاقة هوية وطنية سارية' : 'Valid national ID', isRTL ? 'وثائق داعمة' : 'Supporting documents', isRTL ? 'رقم مشترك التأمين (إن وجد)' : 'NHIF membership number (if any)'].map((item, i) => (
            <ListItem key={i}><ListItemIcon sx={{ minWidth: 28 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospital sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, lineHeight: 1.2 }}>{txt.title}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{txt.oid}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {[{ label: isRTL ? 'متصل' : 'Online', color: H }, { label: '★ 4.4/5', color: H }, { label: isRTL ? 'عالي الأهمية' : 'High Priority', color: '#ef4444' }].map(c => (
            <Chip key={c.label} label={c.label} size="small" sx={{ bgcolor: `${c.color}20`, color: c.color, fontWeight: 700, border: `1px solid ${c.color}40` }} />
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', mb: 0 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'none', fontSize: '0.88rem' }, '& .Mui-selected': { color: H }, '& .MuiTabs-indicator': { bgcolor: H } }}>
          {txt.tabs.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>
      </Box>

      {/* Tab 0 — Overview */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {overviewStats.map(s => <Grid item xs={6} sm={4} md={3} key={s.label}><GovStatCard {...s} /></Grid>)}
        </Grid>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{txt.diseaseAlert}</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {diseaseAlerts.map(d => (
            <Grid item xs={12} sm={6} md={4} key={d.disease}>
              <Card sx={{ background: `${d.color}12`, border: `1px solid ${d.color}30` }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>{d.disease}</Typography>
                    <Chip label={d.status} size="small" sx={{ bgcolor: `${d.color}25`, color: d.color, fontWeight: 700, fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{d.region}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* NHIF quick check */}
        <Paper sx={{ p: 2.5, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{txt.nhifLabel}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField placeholder={isRTL ? 'مثال: 102-456-789' : 'e.g. 102-456-789'} value={nhifSearch} onChange={e => setNhifSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNhifSearch()} size="small"
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { color: 'rgba(255,255,255,0.9)', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
            <Button variant="contained" startIcon={<Search />} onClick={handleNhifSearch} sx={{ bgcolor: N, '&:hover': { bgcolor: '#4f46e5' } }}>{txt.nhifBtn}</Button>
          </Box>
          {nhifResult && (
            <Box sx={{ mt: 2, p: 2, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: H }} />
                <Typography variant="subtitle2" sx={{ color: H, fontWeight: 700 }}>{isRTL ? 'مشترك نشط' : 'Active Member'}</Typography>
              </Box>
              <Grid container spacing={1}>
                {[[isRTL ? 'رقم العضوية' : 'Member ID', nhifResult.memberId], [isRTL ? 'الخطة' : 'Plan', nhifResult.plan], [isRTL ? 'تاريخ الانتهاء' : 'Expiry', nhifResult.expiryDate], [isRTL ? 'المنشآت المعتمدة' : 'Facilities', nhifResult.facilities]].map(([k, v]) => (
                  <Grid item xs={6} key={k}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </TabPanel>

      {/* Tab 1 — Services */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{txt.services}</Typography>
        <Grid container spacing={2}>
          {serviceItems.map(service => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
              <GovServiceCard service={service} onClick={() => setServiceDialog(service)} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 2 — Appointments */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: H, fontWeight: 700, mb: 2 }}>{isRTL ? 'حجز موعد جديد' : 'Book New Appointment'}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>{txt.specialty}</InputLabel>
                    <Select value={aptSpecialty} label={txt.specialty} onChange={e => setAptSpecialty(e.target.value)}
                      sx={{ color: 'rgba(255,255,255,0.9)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                      {specialties.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>{txt.hospital}</InputLabel>
                    <Select value={aptHospital} label={txt.hospital} onChange={e => setAptHospital(e.target.value)}
                      sx={{ color: 'rgba(255,255,255,0.9)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                      {hospitals.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="date" label={txt.preferredDate} size="small" value={aptDate} onChange={e => setAptDate(e.target.value)}
                    InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.6)' } }} inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                    sx={{ '& .MuiOutlinedInput-root': { color: 'rgba(255,255,255,0.9)', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }} />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" startIcon={<CalendarMonth />} sx={{ bgcolor: H, '&:hover': { bgcolor: H } }}
                    onClick={() => {
                      if (!aptSpecialty || !aptHospital || !aptDate) { showSnack(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'warning'); return; }
                      showSnack(isRTL ? `تم حجز الموعد! APT-${Date.now().toString().slice(-6)}` : `Appointment booked! Ref: APT-${Date.now().toString().slice(-6)}`);
                      setAptSpecialty(''); setAptHospital(''); setAptDate('');
                    }}>
                    {txt.bookAppt}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{isRTL ? 'مواعيدك الحالية' : 'Your Upcoming Appointments'}</Typography>
              <Alert severity="info" icon={<Info />}>{isRTL ? 'ستظهر مواعيدك هنا بعد تسجيل الدخول.' : 'Your booked appointments will appear here after logging in.'}</Alert>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3 — Telemedicine */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <VideoCall sx={{ color: H, fontSize: 32 }} />
                <Typography variant="h6" sx={{ color: H, fontWeight: 700 }}>{isRTL ? 'استشارة طبية فورية' : 'Instant Medical Consultation'}</Typography>
              </Box>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {[[isRTL ? 'متوسط الانتظار' : 'Avg. Wait', '18 min'], [isRTL ? 'الأطباء المتاحون' : 'Doctors Online', '1,840'], [isRTL ? 'اللغات' : 'Languages', 'AR / EN'], [isRTL ? 'التكلفة' : 'Cost', isRTL ? 'مجاني (NHIF)' : 'Free (NHIF)']].map(([k, v]) => (
                  <Grid item xs={6} key={k}>
                    <Box sx={{ p: 1.5, background: 'rgba(16,185,129,0.1)', borderRadius: 1.5, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: H, fontWeight: 700 }}>{v}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{k}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>{txt.specialty}</InputLabel>
                <Select value={teleSpecialty} label={txt.specialty} onChange={e => setTeleSpecialty(e.target.value)}
                  sx={{ color: 'rgba(255,255,255,0.9)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                  {specialties.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <Button fullWidth variant="contained" startIcon={<VideoCall />} sx={{ bgcolor: H, '&:hover': { bgcolor: '#059669' } }}
                onClick={() => { if (!teleSpecialty) { showSnack(isRTL ? 'يرجى اختيار التخصص' : 'Please select a specialty', 'warning'); return; } showSnack(isRTL ? 'جاري الاتصال...' : 'Connecting to a doctor...'); }}>
                {txt.startConsult}
              </Button>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{isRTL ? 'أو عبر USSD: *140*4#' : 'Or via USSD: *140*4#'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{txt.topSpecialties}</Typography>
            <Grid container spacing={1.5}>
              {specialties.map(sp => (
                <Grid item xs={12} sm={6} key={sp}>
                  <Card onClick={() => { setTeleSpecialty(sp); showSnack(isRTL ? 'جاري الاتصال...' : 'Connecting...'); }}
                    sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', '&:hover': { borderColor: '#10b981', background: 'rgba(16,185,129,0.08)' } }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>{sp}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <span style={{ color: H }}>★</span>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>4.{Math.floor(4 + Math.random() * 1)}/5 · {isRTL ? 'متاح' : 'Available'}</Typography>
                        </Box>
                      </Box>
                      <Chip label={isRTL ? 'اتصل' : 'Connect'} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: H, cursor: 'pointer' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4 — Records */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{txt.vaccineSchedule}</Typography>
            <TableContainer component={Paper} sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: H, fontWeight: 700 }}>{isRTL ? 'التطعيم' : 'Vaccine'}</TableCell>
                    <TableCell sx={{ color: H, fontWeight: 700 }}>{isRTL ? 'الموعد' : 'When'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccineRows.map(v => (
                    <TableRow key={v.vaccine}>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem' }}>{v.vaccine}</TableCell>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem' }}>{v.when}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button variant="outlined" startIcon={<CalendarMonth />} fullWidth sx={{ mt: 2, borderColor: '#f59e0b', color: H }}
              onClick={() => showSnack(isRTL ? 'جاري حجز موعد التطعيم...' : 'Booking vaccination appointment...')}>
              {isRTL ? 'احجز موعد تطعيم' : 'Book Vaccination Appointment'}
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{isRTL ? 'طلب السجلات الطبية' : 'Request Medical Records'}</Typography>
            <Paper sx={{ p: 2.5, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 2 }}>
              <List dense>
                {[{ label: isRTL ? 'ملخص سجل الصحة' : 'Health Summary Record', icon: <MedicalServices /> }, { label: isRTL ? 'نتائج المختبر' : 'Lab Results', icon: <Science /> }, { label: isRTL ? 'ملخص الخروج' : 'Discharge Summary', icon: <LocalHospital /> }, { label: isRTL ? 'سجل التطعيمات' : 'Vaccination History', icon: <Vaccines /> }, { label: isRTL ? 'الوصفات الطبية' : 'Prescription History', icon: <Medication /> }].map((r, i) => (
                  <ListItem key={i} divider={i < 4} sx={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    secondaryAction={<Button size="small" startIcon={<Download />} sx={{ color: N }} onClick={() => showSnack(isRTL ? 'جاري تنزيل السجل...' : 'Downloading record...')}>{isRTL ? 'تنزيل' : 'Download'}</Button>}>
                    <ListItemIcon sx={{ minWidth: 36, color: N }}>{r.icon}</ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{r.label}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5 — Emergency */}
      <TabPanel value={activeTab} index={5}>
        <Alert severity="error" sx={{ mb: 3, fontWeight: 700 }}>{txt.emergencyNote}</Alert>
        <Grid container spacing={2}>
          {txt.emergencyContacts.map(c => (
            <Grid item xs={12} sm={6} md={4} key={c.number}>
              <Card sx={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ color: '#ef4444' }}>{c.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{c.label}</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1 }}>{c.number}</Typography>
                  <Button variant="outlined" size="small" startIcon={<Phone />} fullWidth
                    sx={{ mt: 1.5, borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' } }}
                    onClick={() => showSnack(isRTL ? `جاري الاتصال بـ ${c.number}...` : `Calling ${c.number}...`, 'info')}>
                    {isRTL ? 'اتصل الآن' : 'Call Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, mb: 2 }}>{isRTL ? 'أقرب غرف الطوارئ' : 'Nearest Emergency Rooms'}</Typography>
        <Grid container spacing={2}>
          {['Khartoum Teaching Hospital', 'Soba University Hospital', 'Ibn Sina Hospital', 'Police Hospital Khartoum'].map((h, i) => (
            <Grid item xs={12} sm={6} key={h}>
              <Card sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>{h}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>{[2.1, 5.8, 3.4, 4.2][i]} km · 24/7</Typography>
                  </Box>
                  <Button size="small" variant="contained" sx={{ bgcolor: ER, '&:hover': { bgcolor: '#b91c1c' } }}
                    onClick={() => showSnack(isRTL ? 'جاري فتح الخريطة...' : 'Opening map...', 'info')}>
                    {isRTL ? 'الاتجاهات' : 'Directions'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Service Dialog */}
      <Dialog open={!!serviceDialog} onClose={() => { setServiceDialog(null); setAppointmentStep(0); }} maxWidth="sm" fullWidth>
        {serviceDialog && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ color: serviceDialog.color }}>{serviceDialog.icon}</Box>
              {serviceDialog.label}
            </DialogTitle>
            <DialogContent dividers>{renderDialogContent(serviceDialog)}</DialogContent>
            <DialogActions>
              <Button onClick={() => { setServiceDialog(null); setAppointmentStep(0); }}>{txt.close}</Button>
              {serviceDialog.id !== 'appointment' && (
                <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); showSnack(isRTL ? 'جاري تنزيل النموذج...' : 'Downloading form...'); }}>{txt.download}</Button>
              )}
              <Button variant="contained" startIcon={serviceDialog.id === 'appointment' ? <CalendarMonth /> : <CheckCircle />}
                onClick={() => { if (serviceDialog.id === 'appointment') handleBookAppointment(); else { setServiceDialog(null); showSnack(isRTL ? `تم تسجيل طلبك. REF-${Date.now().toString().slice(-6)}` : `Application registered. REF-${Date.now().toString().slice(-6)}`); } }}
                sx={{ bgcolor: serviceDialog.color, '&:hover': { filter: 'brightness(0.85)' } }}>
                {serviceDialog.id === 'appointment' ? txt.bookAppt : txt.apply}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthMinistryPortal;
