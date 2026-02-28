import React, { useState } from 'react';
import {
  Box, Typography, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, Snackbar, Alert,
  Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  AccountBalance, TrendingUp, CurrencyExchange, Receipt,
  Savings, Assessment, Business, CheckCircle, Download, Search,
  AttachMoney, PieChart, ShowChart,
} from '@mui/icons-material';
import { GovStatCard, GovServiceCard } from './GovCard';





const FinanceMinistryPortal = ({ language = 'en' }) => {
  const isRTL = language === 'ar';
  const [serviceDialog, setServiceDialog] = useState(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const showSnack = (msg) => { setSnackMsg(msg); setSnackOpen(true); };

  const serviceItems = [
    { id: 'tax', icon: <Receipt />, label: isRTL ? 'الإقرار الضريبي' : 'Tax Return Filing', desc: isRTL ? 'تقديم الإقرار الضريبي السنوي إلكترونياً' : 'File annual income and corporate tax returns online', color: '#7A4B0A', cta: isRTL ? 'قدّم الآن' : 'File Now' },
    { id: 'customs', icon: <Business />, label: isRTL ? 'الجمارك والاستيراد' : 'Customs & Import Duties', desc: isRTL ? 'حساب الرسوم الجمركية وتسوية الدفع' : 'Calculate customs duties and settle import payments', color: '#7A4B0A', cta: isRTL ? 'احسب الرسوم' : 'Calculate' },
    { id: 'budget', icon: <PieChart />, label: isRTL ? 'الميزانية الوطنية' : 'National Budget Portal', desc: isRTL ? 'الاطلاع على ميزانية الدولة وتقارير الإنفاق' : 'View the national budget, allocations and spending reports', color: '#7A4B0A', cta: isRTL ? 'استعرض' : 'View' },
    { id: 'subsidy', icon: <Savings />, label: isRTL ? 'طلب دعم حكومي' : 'Government Subsidy Application', desc: isRTL ? 'التقدم للحصول على دعم الوقود أو الغذاء أو الزراعة' : 'Apply for fuel, food or agriculture subsidies', color: '#7A4B0A', cta: isRTL ? 'قدّم الآن' : 'Apply' },
    { id: 'forex', icon: <CurrencyExchange />, label: isRTL ? 'الصرف الأجنبي' : 'Foreign Exchange', desc: isRTL ? 'أسعار الصرف الرسمية وإجراءات تحويل العملات' : 'Official exchange rates and foreign currency transfer procedures', color: '#7A4B0A', cta: isRTL ? 'تحقق من الأسعار' : 'Check Rates' },
    { id: 'debt', icon: <Assessment />, label: isRTL ? 'إدارة الدين العام' : 'Public Debt Management', desc: isRTL ? 'بيانات الدين العام والسندات الحكومية' : 'Public debt statistics, government bonds and sukuk issuances', color: '#7A4B0A', cta: isRTL ? 'اطلع على البيانات' : 'View Data' },
    { id: 'investment', icon: <TrendingUp />, label: isRTL ? 'بيئة الاستثمار' : 'Investment Environment', desc: isRTL ? 'الحوافز الاستثمارية والإعفاءات الضريبية للمستثمرين' : 'Tax incentives, free zones and investor facilitation services', color: '#7A4B0A', cta: isRTL ? 'استكشف' : 'Explore' },
    { id: 'micropay', icon: <AttachMoney />, label: isRTL ? 'المدفوعات الحكومية' : 'Government Payments', desc: isRTL ? 'سداد المخالفات والرسوم والغرامات الحكومية' : 'Pay fines, fees, levies and government charges online', color: '#7A4B0A', cta: isRTL ? 'ادفع الآن' : 'Pay Now' },
  ];

  const economicData = [
    { label: isRTL ? 'الناتج المحلي الإجمالي' : 'GDP (2024 est.)', value: '$167.5B', change: '+3.2%', up: true },
    { label: isRTL ? 'التضخم' : 'Inflation Rate', value: '63.3%', change: '-12.4%', up: false },
    { label: isRTL ? 'احتياطيات النقد الأجنبي' : 'FX Reserves', value: '$1.8B', change: '+8.1%', up: true },
    { label: isRTL ? 'عجز الميزانية' : 'Budget Deficit', value: '3.6% GDP', change: '-0.8%', up: true },
    { label: isRTL ? 'إيرادات النفط' : 'Oil Revenue', value: '$2.1B', change: '+5.3%', up: true },
    { label: isRTL ? 'التحويلات' : 'Remittances', value: '$2.4B', change: '+18.5%', up: true },
  ];

  const stats = [
    { value: '$167.5B', label: isRTL ? 'الناتج المحلي الإجمالي' : 'GDP (est. 2024)', color: '#7A4B0A', progress: 68, icon: <ShowChart /> },
    { value: '63.3%', label: isRTL ? 'معدل التضخم' : 'Inflation Rate', color: '#7A4B0A', progress: 63, icon: <TrendingUp /> },
    { value: '48.5B SDG', label: isRTL ? 'ميزانية الدولة' : 'State Budget (SDG)', color: '#7A4B0A', progress: 72, icon: <AccountBalance /> },
    { value: '$2.4B', label: isRTL ? 'تحويلات المغتربين' : 'Diaspora Remittances', color: '#7A4B0A', progress: 80, icon: <CurrencyExchange /> },
  ];

  return (
    <Box sx={{ p: 3, direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: '#7A4B0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountBalance sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700, lineHeight: 1.2 }}>
              {isRTL ? 'وزارة المالية والتخطيط الاقتصادي' : 'Ministry of Finance & Economic Planning'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>OID: 1.3.6.1.4.1.61026.4.1.6</Typography>
          </Box>
        </Box>
      </Box>

      {/* Key Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map(s => <Grid item xs={6} md={3} key={s.label}><GovStatCard {...s} /></Grid>)}
      </Grid>

      {/* Economic Indicators Table */}
      <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, mb: 2 }}>
        {isRTL ? 'المؤشرات الاقتصادية' : 'Economic Indicators'}
      </Typography>
      <TableContainer component={Paper} sx={{ background: '#F9FAFB', border: '1px solid #E5E7EB', mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[isRTL ? 'المؤشر' : 'Indicator', isRTL ? 'القيمة' : 'Value', isRTL ? 'التغير' : 'Change'].map(h => (
                <TableCell key={h} sx={{ color: '#7A4B0A', fontWeight: 700, borderBottom: '1px solid #E5E7EB' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {economicData.map(row => (
              <TableRow key={row.label}>
                <TableCell sx={{ color: '#374151', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{row.label}</TableCell>
                <TableCell sx={{ color: '#111827', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>{row.value}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Chip label={row.change} size="small" sx={{ bgcolor: row.up ? '#DCFCE7' : '#FEE2E2', color: row.up ? '#166534' : '#991B1B', fontWeight: 700, fontSize: '0.72rem' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Services Grid */}
      <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, mb: 2 }}>
        {isRTL ? 'الخدمات المالية والضريبية' : 'Financial & Tax Services'}
      </Typography>
      <Grid container spacing={2}>
        {serviceItems.map(service => (
          <Grid item xs={12} sm={6} md={3} key={service.id}>
            <GovServiceCard service={service} onClick={() => setServiceDialog(service)} />
          </Grid>
        ))}
      </Grid>

      {/* Service Dialog */}
      <Dialog open={!!serviceDialog} onClose={() => setServiceDialog(null)} maxWidth="sm" fullWidth>
        {serviceDialog && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ color: serviceDialog.color }}>{serviceDialog.icon}</Box>
              {serviceDialog.label}
            </DialogTitle>
            <DialogContent dividers>
              <Typography sx={{ mb: 2 }}>{serviceDialog.desc}</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>{isRTL ? 'المستندات المطلوبة:' : 'Required documents:'}</Alert>
              <List dense>
                {[isRTL ? 'بطاقة هوية وطنية سارية' : 'Valid national ID', isRTL ? 'الرقم الضريبي (إن وجد)' : 'Tax identification number', isRTL ? 'المستندات المالية الداعمة' : 'Supporting financial documents'].map((item, i) => (
                  <ListItem key={i}><ListItemIcon sx={{ minWidth: 28 }}><CheckCircle fontSize="small" color="success" /></ListItemIcon><ListItemText primary={item} /></ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setServiceDialog(null)}>{isRTL ? 'إغلاق' : 'Close'}</Button>
              <Button variant="outlined" startIcon={<Download />} onClick={() => { setServiceDialog(null); showSnack(isRTL ? 'جاري تنزيل النموذج...' : 'Downloading form...'); }}>{isRTL ? 'تنزيل النموذج' : 'Download Form'}</Button>
              <Button variant="contained" startIcon={<Search />} sx={{ bgcolor: serviceDialog.color }}
                onClick={() => { setServiceDialog(null); showSnack(isRTL ? `تم تسجيل طلبك. REF-${Date.now().toString().slice(-6)}` : `Application registered. REF-${Date.now().toString().slice(-6)}`); }}>
                {serviceDialog.cta || (isRTL ? 'تأكيد' : 'Confirm')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snackOpen} autoHideDuration={5000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: '100%' }}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FinanceMinistryPortal;
