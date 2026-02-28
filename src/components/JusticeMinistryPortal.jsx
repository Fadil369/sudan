import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import {
  Assignment, Security, People,
  CheckCircle, Download, Search, Article, LibraryBooks
} from '@mui/icons-material';

const JusticeMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const t = {
    en: {
      title: 'Ministry of Justice & Legal Affairs',
      subtitle: 'OID: 1.3.6.1.4.1.61026.4.1.8',
      courts: 'Courts Nationwide', cases: 'Cases This Year', resolved: 'Resolution Rate', lawyers: 'Licensed Lawyers',
      services: 'Legal Services',
      serviceItems: [
        { id: 'case_status', icon: <Assignment />, label: 'Case Status Lookup', desc: 'Track the status of your court case by case number', color: '#0ea5e9' },
        { id: 'legal_aid', icon: <People />, label: 'Legal Aid Application', desc: 'Apply for free legal representation if you cannot afford a lawyer', color: '#10b981' },
        { id: 'birth_reg', icon: <Article />, label: 'Document Authentication', desc: 'Authenticate official documents for legal use', color: '#6366f1' },
        { id: 'court_fees', icon: <Security />, label: 'Court Fee Payment', desc: 'Pay court filing fees and service charges online', color: '#f59e0b' },
        { id: 'notary', icon: <LibraryBooks />, label: 'Notary Services', desc: 'Access notary public services for legal documents', color: '#ec4899' },
        { id: 'legal_db', icon: <LibraryBooks />, label: 'Legal Database', desc: 'Access Sudan legal codes, regulations, and court precedents', color: '#22c55e' },
      ],
      apply: 'Apply Now',
      download: 'Download Form',
      close: 'Close',
    },
    ar: {
      title: 'وزارة العدل والشؤون القانونية',
      subtitle: 'المعرف: 1.3.6.1.4.1.61026.4.1.8',
      courts: 'المحاكم الوطنية', cases: 'القضايا هذا العام', resolved: 'معدل الحسم', lawyers: 'المحامون المرخصون',
      services: 'الخدمات القانونية',
      serviceItems: [
        { id: 'case_status', icon: <Assignment />, label: 'متابعة القضية', desc: 'تتبع حالة قضيتك في المحكمة برقم القضية', color: '#0ea5e9' },
        { id: 'legal_aid', icon: <People />, label: 'طلب المساعدة القانونية', desc: 'التقدم للتمثيل القانوني المجاني إذا لم تستطع تحمّل تكاليف محامٍ', color: '#10b981' },
        { id: 'birth_reg', icon: <Article />, label: 'توثيق الوثائق', desc: 'توثيق الوثائق الرسمية للاستخدام القانوني', color: '#6366f1' },
        { id: 'court_fees', icon: <Security />, label: 'دفع رسوم المحكمة', desc: 'دفع رسوم التقاضي والخدمات القضائية إلكترونياً', color: '#f59e0b' },
        { id: 'notary', icon: <LibraryBooks />, label: 'خدمات كاتب العدل', desc: 'الوصول إلى خدمات كاتب العدل للوثائق القانونية', color: '#ec4899' },
        { id: 'legal_db', icon: <LibraryBooks />, label: 'قاعدة البيانات القانونية', desc: 'الوصول إلى قوانين السودان واللوائح وسوابق المحاكم', color: '#22c55e' },
      ],
      apply: 'قدّم الآن',
      download: 'تنزيل النموذج',
      close: 'إغلاق',
    },
  };
  const txt = t[language] || t.en;

  const stats = [
    { label: txt.courts, value: '439', color: '#0ea5e9', progress: 80 },
    { label: txt.cases, value: '38,500', color: '#f59e0b', progress: 65 },
    { label: txt.resolved, value: '85.7%', color: '#10b981', progress: 86 },
    { label: txt.lawyers, value: '12,500', color: '#a855f7', progress: 72 },
  ];

  const handleApply = (svc) => {
    setServiceDialog(null);
    setSnackMsg(isRTL ? `تم تسجيل طلبك. سيتم التواصل معك قريباً.` : `Your request was registered. You will be contacted shortly.`);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, mb: 1 }}>{txt.title}</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{txt.subtitle}</Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: s.color, fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>{s.label}</Typography>
                <LinearProgress variant="determinate" value={s.progress}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: s.color } }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', mb: 2, fontWeight: 600 }}>{txt.services}</Typography>
      <Grid container spacing={2}>
        {txt.serviceItems.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card sx={{ background: `linear-gradient(135deg, ${service.color}15, ${service.color}05)`, border: `1px solid ${service.color}30`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: service.color } }} onClick={() => setServiceDialog(service)}>
              <CardContent>
                <Box sx={{ color: service.color, mb: 1 }}>{service.icon}</Box>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5 }}>{service.label}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{service.desc}</Typography>
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
              {[isRTL ? 'بطاقة هوية وطنية' : 'National ID card', isRTL ? 'أي وثائق داعمة' : 'Supporting documents', isRTL ? 'إيصال دفع الرسوم' : 'Fee payment receipt'].map((item, i) => (
                <ListItem key={i}><ListItemIcon sx={{ minWidth: 32 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDialog(null)}>{txt.close}</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); setSnackMsg(isRTL ? 'تنزيل...' : 'Downloading...'); setSnackOpen(true); }}>{txt.download}</Button>
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

export default JusticeMinistryPortal;
