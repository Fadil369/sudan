import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import { Public, FlightTakeoff, AssignmentInd, Handshake, Language, CheckCircle, Download, Search, BusinessCenter } from '@mui/icons-material';

const ForeignAffairsMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const t = {
    en: {
      title: 'Ministry of Foreign Affairs',
      subtitle: 'OID: 1.3.6.1.4.1.61026.4.1.9',
      missions: 'Diplomatic Missions', agreements: 'International Agreements', passports: 'Passports Issued (2024)', visas: 'Visas Issued (2024)',
      services: 'Consular & Diplomatic Services',
      serviceItems: [
        { id: 'passport_new', icon: <AssignmentInd />, label: 'New Passport Application', desc: 'Apply for a new Sudanese passport — standard (14 days) or express (5 days)', color: '#0ea5e9' },
        { id: 'passport_renew', icon: <AssignmentInd />, label: 'Passport Renewal', desc: 'Renew your expired or expiring Sudanese passport', color: '#10b981' },
        { id: 'visa_inquiry', icon: <FlightTakeoff />, label: 'Visa Application Tracking', desc: 'Track your visa application status for any country', color: '#6366f1' },
        { id: 'doc_legalize', icon: <Language />, label: 'Document Legalization', desc: 'Legalize and authenticate documents for international use', color: '#f59e0b' },
        { id: 'consular', icon: <Public />, label: 'Consular Services Abroad', desc: 'Access emergency consular assistance while abroad', color: '#ec4899' },
        { id: 'agreement', icon: <Handshake />, label: 'Treaty & Agreement Database', desc: 'Search Sudan\'s bilateral and multilateral agreements', color: '#22c55e' },
        { id: 'investment', icon: <BusinessCenter />, label: 'Foreign Investment Support', desc: 'Support for foreign investors entering the Sudanese market', color: '#a855f7' },
        { id: 'emergency', icon: <Public />, label: 'Emergency Repatriation', desc: 'Emergency assistance for stranded Sudanese citizens abroad', color: '#ef4444' },
      ],
      apply: 'Apply Now', download: 'Download Form', close: 'Close',
    },
    ar: {
      title: 'وزارة الشؤون الخارجية',
      subtitle: 'المعرف: 1.3.6.1.4.1.61026.4.1.9',
      missions: 'البعثات الدبلوماسية', agreements: 'الاتفاقيات الدولية', passports: 'جوازات السفر الصادرة (2024)', visas: 'التأشيرات الصادرة (2024)',
      services: 'الخدمات القنصلية والدبلوماسية',
      serviceItems: [
        { id: 'passport_new', icon: <AssignmentInd />, label: 'طلب جواز سفر جديد', desc: 'التقدم للحصول على جواز سفر سوداني — عادي (14 يوماً) أو مستعجل (5 أيام)', color: '#0ea5e9' },
        { id: 'passport_renew', icon: <AssignmentInd />, label: 'تجديد جواز السفر', desc: 'تجديد جواز السفر السوداني المنتهي أو القارب على الانتهاء', color: '#10b981' },
        { id: 'visa_inquiry', icon: <FlightTakeoff />, label: 'متابعة طلب التأشيرة', desc: 'تتبع حالة طلب تأشيرتك لأي دولة', color: '#6366f1' },
        { id: 'doc_legalize', icon: <Language />, label: 'توثيق الوثائق', desc: 'توثيق الوثائق وتصديقها للاستخدام الدولي', color: '#f59e0b' },
        { id: 'consular', icon: <Public />, label: 'الخدمات القنصلية في الخارج', desc: 'الوصول إلى المساعدة القنصلية الطارئة أثناء السفر', color: '#ec4899' },
        { id: 'agreement', icon: <Handshake />, label: 'قاعدة بيانات المعاهدات', desc: 'البحث في الاتفاقيات الثنائية ومتعددة الأطراف للسودان', color: '#22c55e' },
        { id: 'investment', icon: <BusinessCenter />, label: 'دعم الاستثمار الأجنبي', desc: 'الدعم للمستثمرين الأجانب الراغبين في دخول السوق السودانية', color: '#a855f7' },
        { id: 'emergency', icon: <Public />, label: 'الترحيل الطارئ', desc: 'مساعدة طارئة للمواطنين السودانيين العالقين في الخارج', color: '#ef4444' },
      ],
      apply: 'قدّم الآن', download: 'تنزيل النموذج', close: 'إغلاق',
    },
  };
  const txt = t[language] || t.en;

  const stats = [
    { label: txt.missions, value: '90', color: '#0ea5e9', progress: 78 },
    { label: txt.agreements, value: '312', color: '#10b981', progress: 85 },
    { label: txt.passports, value: '485K', color: '#f59e0b', progress: 90 },
    { label: txt.visas, value: '280K', color: '#a855f7', progress: 72 },
  ];

  const handleApply = () => {
    setServiceDialog(null);
    setSnackMsg(isRTL ? 'تم تسجيل طلبك. سيُرسل رمز المتابعة عبر الرسائل القصيرة.' : 'Application registered. A tracking code will be sent via SMS.');
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
          <Grid item xs={12} sm={6} md={3} key={service.id}>
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
              {[isRTL ? 'هوية وطنية سارية' : 'Valid national ID', isRTL ? 'صور شخصية حديثة' : 'Recent passport photos', isRTL ? 'رسوم الخدمة' : 'Service fee payment'].map((item, i) => (
                <ListItem key={i}><ListItemIcon sx={{ minWidth: 32 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setServiceDialog(null)}>{txt.close}</Button>
            <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); setSnackMsg('Downloading...'); setSnackOpen(true); }}>{txt.download}</Button>
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

export default ForeignAffairsMinistryPortal;
