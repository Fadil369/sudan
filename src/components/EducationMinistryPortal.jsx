import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  School,
  MenuBook,
  People,
  EmojiEvents,
  Assignment,
  CheckCircle,
  Download,
  Search,
  Science
} from '@mui/icons-material';

const EducationMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const t = {
    en: {
      title: 'Ministry of Education & Higher Education',
      subtitle: 'OID: 1.3.6.1.4.1.61026.3',
      schools: 'Schools Nationwide', students: 'Enrolled Students', teachers: 'Qualified Teachers', universities: 'Universities',
      services: 'Educational Services',
      serviceItems: [
        { id: 'cert_verify', icon: <EmojiEvents />, label: 'Certificate Verification', desc: 'Verify authenticity of educational certificates and degrees', color: '#2B2FA8' },
        { id: 'enrollment', icon: <School />, label: 'School Enrollment', desc: 'Enroll children in public schools for the upcoming academic year', color: '#2B2FA8' },
        { id: 'exam_results', icon: <Assignment />, label: 'Exam Results', desc: 'Access Sudan Certificate and Basic Education exam results', color: '#2B2FA8' },
        { id: 'scholarship', icon: <EmojiEvents />, label: 'Scholarships', desc: 'Apply for government scholarships and study grants', color: '#2B2FA8' },
        { id: 'transcript', icon: <MenuBook />, label: 'Academic Transcripts', desc: 'Request official academic transcripts from institutions', color: '#2B2FA8' },
        { id: 'teacher_reg', icon: <People />, label: 'Teacher Registration', desc: 'Register as a certified teacher or renew your teaching license', color: '#2B2FA8' },
        { id: 'uni_apply', icon: <Science />, label: 'University Admission', desc: 'Apply for undergraduate or postgraduate university programmes', color: '#2B2FA8' },
        { id: 'distance', icon: <MenuBook />, label: 'Distance Learning', desc: 'Access online and distance learning programmes', color: '#2B2FA8' },
      ],
      apply: 'Apply Now',
      download: 'Download Form',
      close: 'Close',
    },
    ar: {
      title: 'وزارة التربية والتعليم والتعليم العالي',
      subtitle: 'المعرف: 1.3.6.1.4.1.61026.3',
      schools: 'المدارس في الوطن', students: 'الطلاب الملتحقون', teachers: 'المعلمون المؤهلون', universities: 'الجامعات',
      services: 'الخدمات التعليمية',
      serviceItems: [
        { id: 'cert_verify', icon: <EmojiEvents />, label: 'التحقق من الشهادات', desc: 'التحقق من صحة الشهادات والدرجات العلمية', color: '#2B2FA8' },
        { id: 'enrollment', icon: <School />, label: 'التسجيل المدرسي', desc: 'تسجيل الأطفال في المدارس الحكومية للعام الدراسي القادم', color: '#2B2FA8' },
        { id: 'exam_results', icon: <Assignment />, label: 'نتائج الامتحانات', desc: 'الاطلاع على نتائج شهادة السودان والتعليم الأساسي', color: '#2B2FA8' },
        { id: 'scholarship', icon: <EmojiEvents />, label: 'المنح الدراسية', desc: 'التقدم للمنح الحكومية وبدلات الدراسة', color: '#2B2FA8' },
        { id: 'transcript', icon: <MenuBook />, label: 'كشف الدرجات', desc: 'طلب كشوف الدرجات الأكاديمية الرسمية من المؤسسات', color: '#2B2FA8' },
        { id: 'teacher_reg', icon: <People />, label: 'تسجيل المعلمين', desc: 'التسجيل كمعلم معتمد أو تجديد رخصة التدريس', color: '#2B2FA8' },
        { id: 'uni_apply', icon: <Science />, label: 'القبول الجامعي', desc: 'التقدم لبرامج البكالوريوس أو الدراسات العليا', color: '#2B2FA8' },
        { id: 'distance', icon: <MenuBook />, label: 'التعلم عن بعد', desc: 'الوصول إلى برامج التعلم الإلكتروني والتعليم عن بعد', color: '#2B2FA8' },
      ],
      apply: 'قدّم الآن',
      download: 'تنزيل النموذج',
      close: 'إغلاق',
    },
  };
  const txt = t[language] || t.en;

  const stats = [
    { label: txt.schools, value: '17,420', color: '#2B2FA8', progress: 87 },
    { label: txt.students, value: '10.2M', color: '#2B2FA8', progress: 68 },
    { label: txt.teachers, value: '285K', color: '#2B2FA8', progress: 74 },
    { label: txt.universities, value: '75', color: '#2B2FA8', progress: 90 },
  ];

  const handleApply = (service) => {
    setServiceDialog(null);
    setSnackMsg(isRTL
      ? `تم استلام طلبك لـ "${service}". الرقم المرجعي سيُرسَل عبر الرسائل.`
      : `Your application for "${service}" was received. Reference number will be sent via SMS.`);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700, mb: 1 }}>
          {txt.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
          {txt.subtitle}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #E5E7EB' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>{s.label}</Typography>
                <LinearProgress variant="determinate" value={s.progress}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: s.color } }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ color: '#111827', mb: 2, fontWeight: 600 }}>{txt.services}</Typography>
      <Grid container spacing={2}>
        {txt.serviceItems.map((service) => (
          <Grid item xs={12} sm={6} md={3} key={service.id}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${service.color}15 0%, ${service.color}05 100%)`,
                border: `1px solid ${service.color}30`, cursor: 'pointer',
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: service.color },
              }}
              onClick={() => setServiceDialog(service)}
            >
              <CardContent>
                <Box sx={{ color: service.color, mb: 1 }}>{service.icon}</Box>
                <Typography variant="subtitle2" sx={{ color: '#111827', fontWeight: 600, mb: 0.5 }}>{service.label}</Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.78rem' }}>{service.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!serviceDialog} onClose={() => setServiceDialog(null)} maxWidth="sm" fullWidth>
        {serviceDialog && <>
          <DialogTitle>{serviceDialog.label}</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>{serviceDialog.desc}</Typography>
            <List dense>
              {[
                isRTL ? 'بطاقة هوية سارية' : 'Valid national ID',
                isRTL ? 'وثائق داعمة ذات صلة' : 'Relevant supporting documents',
                isRTL ? 'صورة شخصية حديثة' : 'Recent passport photo',
              ].map((item, i) => (
                <ListItem key={i} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDialog(null)}>{txt.close}</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); setSnackMsg(isRTL ? 'جار تنزيل النموذج...' : 'Downloading form...'); setSnackOpen(true); }}>{txt.download}</Button>
            <Button variant="contained" startIcon={<Search />} onClick={() => handleApply(serviceDialog.label)}>{txt.apply}</Button>
          </DialogActions>
        </>}
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EducationMinistryPortal;
