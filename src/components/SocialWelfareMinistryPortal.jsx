import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Snackbar, Alert
} from '@mui/material';
import { People, Favorite, ChildCare, ElderlyWoman, Home, AttachMoney, CheckCircle, Download, Search, Accessibility } from '@mui/icons-material';

const SocialWelfareMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const t = {
    en: {
      title: 'Ministry of Social Welfare & Women Affairs',
      subtitle: 'OID: 1.3.6.1.4.1.61026.4.1.11',
      beneficiaries: 'Total Beneficiaries', programs: 'Active Programs', budget: 'Annual Budget', centers: 'Social Centers',
      services: 'Social Welfare Services',
      serviceItems: [
        { id: 'cash_transfer', icon: <AttachMoney />, label: 'Cash Transfer (Tawakkalna)', desc: 'Apply for government cash transfer assistance for vulnerable families', color: '#6B1841' },
        { id: 'disability', icon: <Accessibility />, label: 'Disability Support', desc: 'Register for disability benefits and specialized services', color: '#6B1841' },
        { id: 'orphan', icon: <ChildCare />, label: 'Orphan Care Program', desc: 'Enroll orphaned children in the national care program', color: '#6B1841' },
        { id: 'elderly', icon: <ElderlyWoman />, label: 'Elderly Pension', desc: 'Apply for elderly social pension (age 60+)', color: '#6B1841' },
        { id: 'housing', icon: <Home />, label: 'Social Housing', desc: 'Apply for affordable social housing units', color: '#6B1841' },
        { id: 'women', icon: <Favorite />, label: 'Women Empowerment', desc: 'Access programs for women entrepreneurship and legal support', color: '#6B1841' },
        { id: 'food', icon: <People />, label: 'Food Security Subsidy', desc: 'Register for subsidized food assistance programs', color: '#6B1841' },
        { id: 'microfinance', icon: <AttachMoney />, label: 'Zakat & Microfinance', desc: 'Apply for Zakat support or microfinance loans', color: '#6B1841' },
      ],
      apply: 'Apply Now', download: 'Download Form', close: 'Close',
    },
    ar: {
      title: 'وزارة الرعاية الاجتماعية وشؤون المرأة',
      subtitle: 'المعرف: 1.3.6.1.4.1.61026.4.1.11',
      beneficiaries: 'إجمالي المستفيدين', programs: 'البرامج النشطة', budget: 'الميزانية السنوية', centers: 'المراكز الاجتماعية',
      services: 'خدمات الرعاية الاجتماعية',
      serviceItems: [
        { id: 'cash_transfer', icon: <AttachMoney />, label: 'برنامج التحويلات النقدية (توكلنا)', desc: 'التقدم للمساعدة النقدية الحكومية للأسر المستضعفة', color: '#6B1841' },
        { id: 'disability', icon: <Accessibility />, label: 'دعم ذوي الإعاقة', desc: 'التسجيل للحصول على مزايا ذوي الإعاقة والخدمات المتخصصة', color: '#6B1841' },
        { id: 'orphan', icon: <ChildCare />, label: 'برنامج رعاية الأيتام', desc: 'تسجيل الأطفال الأيتام في البرنامج الوطني للرعاية', color: '#6B1841' },
        { id: 'elderly', icon: <ElderlyWoman />, label: 'معاش كبار السن', desc: 'التقدم للمعاش الاجتماعي لكبار السن (60 عاماً فأكثر)', color: '#6B1841' },
        { id: 'housing', icon: <Home />, label: 'الإسكان الاجتماعي', desc: 'التقدم لوحدات سكنية ميسورة التكلفة', color: '#6B1841' },
        { id: 'women', icon: <Favorite />, label: 'تمكين المرأة', desc: 'الوصول إلى برامج ريادة الأعمال والدعم القانوني للمرأة', color: '#6B1841' },
        { id: 'food', icon: <People />, label: 'دعم الأمن الغذائي', desc: 'التسجيل في برامج دعم الغذاء المدعوم', color: '#6B1841' },
        { id: 'microfinance', icon: <AttachMoney />, label: 'الزكاة والتمويل الأصغر', desc: 'التقدم لدعم الزكاة أو قروض التمويل الأصغر', color: '#6B1841' },
      ],
      apply: 'قدّم الآن', download: 'تنزيل النموذج', close: 'إغلاق',
    },
  };
  const txt = t[language] || t.en;

  const stats = [
    { label: txt.beneficiaries, value: '5.06M', color: '#6B1841', progress: 75 },
    { label: txt.programs, value: '7', color: '#6B1841', progress: 90 },
    { label: txt.budget, value: '53B SDG', color: '#6B1841', progress: 82 },
    { label: txt.centers, value: '420', color: '#6B1841', progress: 68 },
  ];

  const handleApply = () => {
    setServiceDialog(null);
    setSnackMsg(isRTL ? 'تم تسجيل طلبك. سيتم التحقق منه خلال 5-7 أيام.' : 'Your application was registered. It will be reviewed within 5-7 working days.');
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
          <Grid item xs={12} sm={6} md={3} key={service.id}>
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
              {[isRTL ? 'هوية وطنية سارية' : 'Valid national ID', isRTL ? 'إثبات الدخل أو الحاجة' : 'Proof of income or need', isRTL ? 'توصية من المركز الاجتماعي المحلي' : 'Referral from local social center'].map((item, i) => (
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

export default SocialWelfareMinistryPortal;
