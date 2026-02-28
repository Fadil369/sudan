import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import { Work, School, People, Assessment, Business, CheckCircle, Download, Search } from '@mui/icons-material';

const LaborMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const t = {
    en: {
      title: 'Ministry of Labor & Social Development',
      subtitle: 'OID: 1.3.6.1.4.1.61026.4.1.10',
      workforce: 'Total Workforce', employed: 'Employed', unemployment: 'Unemployment Rate', training: 'Training Centers',
      services: 'Labor & Employment Services',
      serviceItems: [
        { id: 'job_search', icon: <Work />, label: 'Job Portal', desc: 'Search 85,000+ job vacancies across all sectors', color: '#0D4A6B' },
        { id: 'work_permit', icon: <Business />, label: 'Work Permit', desc: 'Apply for or renew work permits for foreign nationals', color: '#0D4A6B' },
        { id: 'training', icon: <School />, label: 'Vocational Training', desc: 'Enroll in government-funded vocational training programs', color: '#0D4A6B' },
        { id: 'labor_complaint', icon: <Assessment />, label: 'Labor Dispute Filing', desc: 'File a labor dispute or workplace complaint', color: '#0D4A6B' },
        { id: 'social_insurance', icon: <People />, label: 'Social Insurance', desc: 'Register for or manage your social insurance contributions', color: '#0D4A6B' },
        { id: 'remittance', icon: <Assessment />, label: 'Migrant Worker Services', desc: 'Services for Sudanese workers abroad and their families', color: '#0D4A6B' },
      ],
      apply: 'Apply Now', download: 'Download Form', close: 'Close',
    },
    ar: {
      title: 'وزارة العمل والتنمية الاجتماعية',
      subtitle: 'المعرف: 1.3.6.1.4.1.61026.4.1.10',
      workforce: 'القوى العاملة', employed: 'الموظفون', unemployment: 'معدل البطالة', training: 'مراكز التدريب',
      services: 'خدمات العمل والتوظيف',
      serviceItems: [
        { id: 'job_search', icon: <Work />, label: 'بوابة الوظائف', desc: 'ابحث عن أكثر من 85,000 وظيفة في جميع القطاعات', color: '#0D4A6B' },
        { id: 'work_permit', icon: <Business />, label: 'تصريح العمل', desc: 'التقدم للحصول على تصاريح عمل للأجانب أو تجديدها', color: '#0D4A6B' },
        { id: 'training', icon: <School />, label: 'التدريب المهني', desc: 'الالتحاق ببرامج التدريب المهني الممولة حكومياً', color: '#0D4A6B' },
        { id: 'labor_complaint', icon: <Assessment />, label: 'رفع نزاع عمالي', desc: 'تقديم نزاع عمالي أو شكوى من بيئة العمل', color: '#0D4A6B' },
        { id: 'social_insurance', icon: <People />, label: 'التأمين الاجتماعي', desc: 'التسجيل في التأمين الاجتماعي أو إدارة اشتراكاتك', color: '#0D4A6B' },
        { id: 'remittance', icon: <Assessment />, label: 'خدمات العمالة المهاجرة', desc: 'خدمات العمال السودانيين في الخارج وأسرهم', color: '#0D4A6B' },
      ],
      apply: 'قدّم الآن', download: 'تنزيل النموذج', close: 'إغلاق',
    },
  };
  const txt = t[language] || t.en;

  const stats = [
    { label: txt.workforce, value: '15.2M', color: '#0D4A6B', progress: 100 },
    { label: txt.employed, value: '12.4M', color: '#0D4A6B', progress: 82 },
    { label: txt.unemployment, value: '18.4%', color: '#0D4A6B', progress: 18 },
    { label: txt.training, value: '185', color: '#0D4A6B', progress: 60 },
  ];

  const handleApply = () => {
    setServiceDialog(null);
    setSnackMsg(isRTL ? 'تم تسجيل طلبك بنجاح.' : 'Your application was successfully registered.');
    setSnackOpen(true);
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700, mb: 1 }}>{txt.title}</Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>{txt.subtitle}</Typography>
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
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card sx={{ background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`, border: `1px solid ${service.color}30`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: service.color } }} onClick={() => setServiceDialog(service)}>
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
              {[isRTL ? 'وثيقة هوية سارية' : 'Valid ID document', isRTL ? 'وثائق داعمة' : 'Supporting documents', isRTL ? 'رسوم الخدمة إن وُجدت' : 'Service fee if applicable'].map((item, i) => (
                <ListItem key={i}><ListItemIcon sx={{ minWidth: 32 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDialog(null)}>{txt.close}</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); setSnackMsg(isRTL ? 'تنزيل النموذج...' : 'Downloading form...'); setSnackOpen(true); }}>{txt.download}</Button>
            <Button variant="contained" startIcon={<Search />} onClick={handleApply}>{txt.apply}</Button>
          </DialogActions>
        </>}
      </Dialog>
      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LaborMinistryPortal;
