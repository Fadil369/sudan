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
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Payment,
  Receipt,
  Assessment,
  PieChart,
  Download,
  CreditCard,
  AccountBalanceWallet,
  MonetizationOn,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function FinanceMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const financeStats = {
    balance: '125,450',
    taxesPaid: '45,200',
    pendingPayments: 2,
    budgetUtilization: 68,
  };

  const recentTransactions = [
    {
      description: 'Income Tax Payment - Q1 2026',
      amount: '-15,500',
      date: '2026-02-28',
      status: 'Completed',
      type: 'tax',
      color: '#dc2626',
    },
    {
      description: 'VAT Refund',
      amount: '+2,340',
      date: '2026-02-15',
      status: 'Completed',
      type: 'refund',
      color: '#16a34a',
    },
    {
      description: 'Business License Fee',
      amount: '-850',
      date: '2026-02-01',
      status: 'Completed',
      type: 'fee',
      color: '#7c3aed',
    },
  ];

  const budgetBreakdown = [
    { category: 'Income Tax', amount: 15500, percentage: 52, color: '#2563eb' },
    { category: 'VAT', amount: 8900, percentage: 30, color: '#16a34a' },
    { category: 'Business Fees', amount: 3200, percentage: 11, color: '#7c3aed' },
    { category: 'Other', amount: 2100, percentage: 7, color: '#ea580c' },
  ];

  const upcomingPayments = [
    {
      title: 'Property Tax - 2026',
      amount: '12,500',
      dueDate: '2026-04-30',
      status: 'Due Soon',
      color: '#ea580c',
    },
    {
      title: 'Vehicle Registration',
      amount: '450',
      dueDate: '2026-05-15',
      status: 'Upcoming',
      color: '#2563eb',
    },
  ];

  const services = [
    {
      title: isRTL ? 'دفع الضرائب' : 'Tax Payment',
      description: isRTL
        ? 'دفع ضرائب الدخل والشركات إلكترونياً'
        : 'Pay income and corporate taxes electronically',
      icon: Payment,
      color: '#7c3aed',
      featured: true,
      stats: [
        { value: `${financeStats.taxesPaid} SDG`, label: isRTL ? 'مدفوع 2026' : 'Paid 2026' },
      ],
      actions: [
        {
          label: isRTL ? 'دفع الآن' : 'Pay Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الإقرار الضريبي' : 'Tax Returns',
      description: isRTL
        ? 'تقديم وعرض الإقرارات الضريبية'
        : 'Submit and view tax return declarations',
      icon: Receipt,
      color: '#2563eb',
      badge: isRTL ? 'مطلوب' : 'Due',
      actions: [
        {
          label: isRTL ? 'تقديم الإقرار' : 'File Return',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'المحفظة المالية' : 'Financial Wallet',
      description: isRTL
        ? 'عرض رصيدك والمعاملات المالية'
        : 'View your balance and financial transactions',
      icon: AccountBalanceWallet,
      color: '#16a34a',
      stats: [
        { value: `${financeStats.balance} SDG`, label: isRTL ? 'الرصيد' : 'Balance' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض المحفظة' : 'View Wallet',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'الميزانية الشخصية' : 'Budget Planner',
      description: isRTL
        ? 'تخطيط وتتبع ميزانيتك الشخصية'
        : 'Plan and track your personal budget',
      icon: PieChart,
      color: '#ea580c',
      featured: true,
      stats: [
        { value: `${financeStats.budgetUtilization}%`, label: isRTL ? 'مستخدم' : 'Utilized' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض الميزانية' : 'View Budget',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'التقارير المالية' : 'Financial Reports',
      description: isRTL
        ? 'تحميل التقارير والبيانات المالية'
        : 'Download financial reports and statements',
      icon: Assessment,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'تنزيل التقارير' : 'Download',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'القروض والتمويل' : 'Loans & Financing',
      description: isRTL
        ? 'التقدم للحصول على قروض حكومية'
        : 'Apply for government loans and financing',
      icon: MonetizationOn,
      color: '#dc2626',
      badge: isRTL ? '3 متاحة' : '3 Available',
      actions: [
        {
          label: isRTL ? 'عرض العروض' : 'View Offers',
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
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <AccountBalance sx={{ fontSize: 36 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isRTL ? 'وزارة المالية' : 'Ministry of Finance'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isRTL ? 'الخدمات المالية الرقمية' : 'Digital Financial Services'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="1.3.6.1.4.1.61026.1.4"
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
                  title={isRTL ? 'الرصيد' : 'Balance'}
                  value={financeStats.balance}
                  subtitle="SDG"
                  icon={AccountBalanceWallet}
                  color="#16a34a"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الضرائب المدفوعة' : 'Taxes Paid'}
                  value={financeStats.taxesPaid}
                  subtitle="SDG 2026"
                  icon={Payment}
                  color="#7c3aed"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'مدفوعات معلقة' : 'Pending'}
                  value={financeStats.pendingPayments}
                  subtitle={isRTL ? 'فاتورة' : 'Bills'}
                  icon={Receipt}
                  color="#ea580c"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الميزانية' : 'Budget'}
                  value={`${financeStats.budgetUtilization}%`}
                  icon={PieChart}
                  color="#2563eb"
                  variant="gradient"
                  progress={{ value: financeStats.budgetUtilization, label: 'Used' }}
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
            startIcon={<Payment />}
            sx={{
              py: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              fontWeight: 700,
            }}
          >
            {isRTL ? 'دفع الضرائب' : 'Pay Taxes'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Receipt />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'تقديم إقرار' : 'File Return'}
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
            {isRTL ? 'التقارير' : 'Reports'}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<CreditCard />}
            sx={{
              py: 2,
              borderRadius: 3,
              borderWidth: 2,
              fontWeight: 700,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isRTL ? 'طرق الدفع' : 'Payment Methods'}
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
          <Tab label={isRTL ? 'المعاملات' : 'Transactions'} />
          <Tab label={isRTL ? 'الميزانية' : 'Budget'} />
          <Tab label={isRTL ? 'المدفوعات القادمة' : 'Upcoming Payments'} />
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

          {/* Transactions Tab */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'المعاملات الأخيرة' : 'Recent Transactions'}
                </Typography>
                <Button variant="outlined" startIcon={<Download />}>
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
              </Box>

              <List>
                {recentTransactions.map((transaction, idx) => (
                  <Box key={idx}>
                    <ListItem
                      sx={{
                        bgcolor: '#f9fafb',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          bgcolor: '#f3f4f6',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: `${transaction.color}15`,
                          color: transaction.color,
                          mr: 2,
                        }}
                      >
                        {transaction.amount.startsWith('-') ? <TrendingUp sx={{ transform: 'rotate(180deg)' }} /> : <TrendingUp />}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {transaction.description}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color: transaction.amount.startsWith('-') ? '#dc2626' : '#16a34a',
                              }}
                            >
                              {transaction.amount} SDG
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" gap={1} mt={1}>
                            <Chip label={transaction.status} size="small" color="success" />
                            <Chip label={transaction.date} size="small" variant="outlined" />
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Box>
          )}

          {/* Budget Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'تفصيل الميزانية 2026' : 'Budget Breakdown 2026'}
              </Typography>

              <Grid container spacing={3}>
                {budgetBreakdown.map((item, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${item.color}20`,
                        background: `linear-gradient(135deg, ${item.color}05 0%, #ffffff 100%)`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.category}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: item.color }}>
                          {item.amount.toLocaleString()} SDG
                        </Typography>
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {item.percentage}% {isRTL ? 'من الإجمالي' : 'of total'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${item.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: item.color,
                            },
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Upcoming Payments Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'المدفوعات القادمة' : 'Upcoming Payments'}
              </Typography>

              <Grid container spacing={2}>
                {upcomingPayments.map((payment, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: `2px solid ${payment.color}30`,
                        '&:hover': {
                          borderColor: payment.color,
                          boxShadow: `0 4px 12px ${payment.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {payment.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isRTL ? 'تاريخ الاستحقاق' : 'Due'}: {payment.dueDate}
                          </Typography>
                        </Box>
                        <Chip
                          label={payment.status}
                          sx={{
                            bgcolor: `${payment.color}15`,
                            color: payment.color,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" sx={{ fontWeight: 800, color: payment.color }}>
                          {payment.amount} SDG
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{
                            background: `linear-gradient(135deg, ${payment.color} 0%, ${payment.color}dd 100%)`,
                          }}
                        >
                          {isRTL ? 'دفع الآن' : 'Pay Now'}
                        </Button>
                      </Box>
                    </Paper>
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
