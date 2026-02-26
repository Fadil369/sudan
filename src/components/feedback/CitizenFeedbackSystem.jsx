import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Rating,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  Fab,
  Badge,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  TabPanel,
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Send as SendIcon,
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Campaign as CampaignIcon,
  Poll as PollIcon,
  QuestionAnswer as SurveyIcon,
  Close as CloseIcon,
  AttachFile as AttachIcon,
  Photo as PhotoIcon,
  Mic as MicIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Priority as PriorityIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Flag as FlagIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const CitizenFeedbackSystem = ({ citizenData }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState(0);
  const [showNewFeedback, setShowNewFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackData, setFeedbackData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    ministry: '',
    isAnonymous: false,
    isPublic: false,
    rating: 0,
    attachments: [],
    location: null
  });
  const [myFeedback, setMyFeedback] = useState([]);
  const [publicFeedback, setPublicFeedback] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback categories
  const categories = [
    { value: 'service_quality', label: isRTL ? 'جودة الخدمة' : 'Service Quality', icon: <StarIcon /> },
    { value: 'system_issues', label: isRTL ? 'مشاكل النظام' : 'System Issues', icon: <ErrorIcon /> },
    { value: 'improvement_suggestion', label: isRTL ? 'اقتراح تحسين' : 'Improvement Suggestion', icon: <TrendingUpIcon /> },
    { value: 'complaint', label: isRTL ? 'شكوى' : 'Complaint', icon: <WarningIcon /> },
    { value: 'appreciation', label: isRTL ? 'شكر وتقدير' : 'Appreciation', icon: <ThumbUpIcon /> },
    { value: 'feature_request', label: isRTL ? 'طلب ميزة جديدة' : 'Feature Request', icon: <CampaignIcon /> },
    { value: 'accessibility', label: isRTL ? 'إمكانية الوصول' : 'Accessibility', icon: <PublicIcon /> },
    { value: 'security_concern', label: isRTL ? 'مشكلة أمنية' : 'Security Concern', icon: <FlagIcon /> }
  ];

  // Ministries
  const ministries = [
    { value: 'general', label: isRTL ? 'عام' : 'General' },
    { value: 'health', label: isRTL ? 'الصحة' : 'Health' },
    { value: 'education', label: isRTL ? 'التربية والتعليم' : 'Education' },
    { value: 'interior', label: isRTL ? 'الداخلية' : 'Interior' },
    { value: 'finance', label: isRTL ? 'المالية' : 'Finance' },
    { value: 'energy', label: isRTL ? 'الطاقة' : 'Energy' },
    { value: 'infrastructure', label: isRTL ? 'البنية التحتية' : 'Infrastructure' },
    { value: 'justice', label: isRTL ? 'العدل' : 'Justice' }
  ];

  // Priority levels
  const priorities = [
    { value: 'low', label: isRTL ? 'منخفض' : 'Low', color: 'success' },
    { value: 'medium', label: isRTL ? 'متوسط' : 'Medium', color: 'warning' },
    { value: 'high', label: isRTL ? 'عالي' : 'High', color: 'error' },
    { value: 'urgent', label: isRTL ? 'عاجل' : 'Urgent', color: 'error' }
  ];

  useEffect(() => {
    loadFeedbackData();
    loadSurveys();
    loadAnalytics();
  }, []);

  const loadFeedbackData = async () => {
    // Mock data loading
    const mockMyFeedback = [
      {
        id: 'FB001',
        title: isRTL ? 'مشكلة في تسجيل الدخول' : 'Login Issue',
        category: 'system_issues',
        priority: 'medium',
        status: 'resolved',
        rating: 4,
        date: '2024-01-15T10:30:00Z',
        ministry: 'general',
        response: isRTL ? 'تم حل المشكلة، شكراً لك' : 'Issue has been resolved, thank you'
      },
      {
        id: 'FB002',
        title: isRTL ? 'اقتراح تحسين الواجهة' : 'UI Improvement Suggestion',
        category: 'improvement_suggestion',
        priority: 'low',
        status: 'under_review',
        rating: 0,
        date: '2024-01-20T14:15:00Z',
        ministry: 'general'
      }
    ];

    const mockPublicFeedback = [
      {
        id: 'PFB001',
        title: isRTL ? 'شكر على الخدمة الممتازة' : 'Thanks for Excellent Service',
        category: 'appreciation',
        rating: 5,
        date: '2024-01-22T09:00:00Z',
        ministry: 'health',
        author: isRTL ? 'مواطن سوداني' : 'Sudanese Citizen',
        content: isRTL ? 
          'أشكركم على الخدمة الممتازة في تجديد الوثائق الصحية' :
          'Thank you for the excellent service in renewing health documents',
        likes: 23,
        responses: 5
      }
    ];

    setMyFeedback(mockMyFeedback);
    setPublicFeedback(mockPublicFeedback);
  };

  const loadSurveys = async () => {
    const mockSurveys = [
      {
        id: 'SUR001',
        title: isRTL ? 'تقييم خدمات الهوية الرقمية' : 'Digital Identity Services Evaluation',
        description: isRTL ? 
          'ساعدنا في تحسين خدمات الهوية الرقمية من خلال تقييمك' :
          'Help us improve digital identity services through your evaluation',
        questions: 8,
        duration: 5,
        reward: isRTL ? '10 نقاط' : '10 points',
        deadline: '2024-02-15T23:59:59Z',
        completed: false
      },
      {
        id: 'SUR002',
        title: isRTL ? 'مسح رضا المواطنين' : 'Citizen Satisfaction Survey',
        description: isRTL ?
          'شاركنا رأيك حول مستوى الخدمات الحكومية' :
          'Share your opinion about the level of government services',
        questions: 12,
        duration: 8,
        reward: isRTL ? '15 نقاط' : '15 points',
        deadline: '2024-02-28T23:59:59Z',
        completed: true
      }
    ];

    setSurveys(mockSurveys);
  };

  const loadAnalytics = async () => {
    const mockAnalytics = {
      totalFeedback: 1247,
      resolvedFeedback: 1089,
      avgResponseTime: 2.3,
      satisfactionScore: 4.2,
      categoryBreakdown: {
        service_quality: 35,
        system_issues: 25,
        improvement_suggestion: 20,
        complaint: 12,
        appreciation: 8
      },
      monthlyTrend: [120, 135, 98, 156, 143, 167, 189, 201, 178, 145, 132, 156]
    };

    setAnalytics(mockAnalytics);
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newFeedback = {
        id: `FB${Date.now()}`,
        ...feedbackData,
        date: new Date().toISOString(),
        status: 'submitted',
        citizenId: citizenData?.oid
      };

      setMyFeedback(prev => [newFeedback, ...prev]);
      
      // Reset form
      setFeedbackData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        ministry: '',
        isAnonymous: false,
        isPublic: false,
        rating: 0,
        attachments: [],
        location: null
      });

      setShowNewFeedback(false);
      setActiveTab(1); // Switch to My Feedback tab
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'under_review': return 'warning';
      case 'submitted': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: isRTL ? 'مُرسل' : 'Submitted',
      under_review: isRTL ? 'قيد المراجعة' : 'Under Review',
      resolved: isRTL ? 'محلول' : 'Resolved',
      rejected: isRTL ? 'مرفوض' : 'Rejected'
    };
    return labels[status] || status;
  };

  const renderNewFeedbackForm = () => (
    <Dialog open={showNewFeedback} onClose={() => setShowNewFeedback(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isRTL ? 'تقديم ملاحظة جديدة' : 'Submit New Feedback'}
          </Typography>
          <IconButton onClick={() => setShowNewFeedback(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={0} orientation="vertical">
          <Step active>
            <StepLabel>{isRTL ? 'معلومات أساسية' : 'Basic Information'}</StepLabel>
            <StepContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isRTL ? 'العنوان' : 'Title'}
                    value={feedbackData.title}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{isRTL ? 'التصنيف' : 'Category'}</InputLabel>
                    <Select
                      value={feedbackData.category}
                      label={isRTL ? 'التصنيف' : 'Category'}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Box display="flex" alignItems="center">
                            {category.icon}
                            <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الوزارة المعنية' : 'Relevant Ministry'}</InputLabel>
                    <Select
                      value={feedbackData.ministry}
                      label={isRTL ? 'الوزارة المعنية' : 'Relevant Ministry'}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, ministry: e.target.value }))}
                    >
                      {ministries.map((ministry) => (
                        <MenuItem key={ministry.value} value={ministry.value}>
                          {ministry.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={isRTL ? 'التفاصيل' : 'Details'}
                    value={feedbackData.description}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isRTL ? 'الأولوية' : 'Priority'}</InputLabel>
                    <Select
                      value={feedbackData.priority}
                      label={isRTL ? 'الأولوية' : 'Priority'}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      {priorities.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          <Chip label={priority.label} color={priority.color} size="small" />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography component="legend" gutterBottom>
                    {isRTL ? 'التقييم (اختياري)' : 'Rating (optional)'}
                  </Typography>
                  <Rating
                    name="feedback-rating"
                    value={feedbackData.rating}
                    onChange={(event, newValue) => {
                      setFeedbackData(prev => ({ ...prev, rating: newValue || 0 }));
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={feedbackData.isAnonymous}
                        onChange={(e) => setFeedbackData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      />
                    }
                    label={isRTL ? 'إرسال بشكل مجهول' : 'Submit anonymously'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={feedbackData.isPublic}
                        onChange={(e) => setFeedbackData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                    }
                    label={isRTL ? 'السماح بنشر الملاحظة للعامة' : 'Allow public sharing of feedback'}
                  />
                </Grid>
              </Grid>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setShowNewFeedback(false)}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitFeedback}
          disabled={isSubmitting || !feedbackData.title || !feedbackData.description || !feedbackData.category}
          startIcon={isSubmitting ? <LinearProgress size={20} /> : <SendIcon />}
        >
          {isSubmitting ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال' : 'Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FeedbackIcon />}
                  onClick={() => setShowNewFeedback(true)}
                  sx={{ p: 2 }}
                >
                  {isRTL ? 'تقديم ملاحظة' : 'Submit Feedback'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SurveyIcon />}
                  onClick={() => setActiveTab(3)}
                  sx={{ p: 2 }}
                >
                  {isRTL ? 'المشاركة في استبيان' : 'Take Survey'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ViewIcon />}
                  onClick={() => setActiveTab(2)}
                  sx={{ p: 2 }}
                >
                  {isRTL ? 'عرض الآراء العامة' : 'View Public Feedback'}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AnalyticsIcon />}
                  onClick={() => setActiveTab(4)}
                  sx={{ p: 2 }}
                >
                  {isRTL ? 'الإحصائيات' : 'Analytics'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <FeedbackIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              {analytics.totalFeedback?.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isRTL ? 'إجمالي الملاحظات' : 'Total Feedback'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CompleteIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {((analytics.resolvedFeedback / analytics.totalFeedback) * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isRTL ? 'معدل الحل' : 'Resolution Rate'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main">
              {analytics.avgResponseTime}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isRTL ? 'متوسط وقت الاستجابة (أيام)' : 'Avg Response Time (days)'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main">
              {analytics.satisfactionScore}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isRTL ? 'درجة الرضا' : 'Satisfaction Score'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
            </Typography>
            <List>
              {myFeedback.slice(0, 3).map((feedback, index) => (
                <ListItem key={feedback.id}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: getStatusColor(feedback.status) + '.main' }}>
                      {categories.find(c => c.value === feedback.category)?.icon}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={feedback.title}
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getStatusLabel(feedback.status)}
                          color={getStatusColor(feedback.status)}
                          size="small"
                        />
                        <Typography variant="caption">
                          {new Date(feedback.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMyFeedbackTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {isRTL ? 'ملاحظاتي' : 'My Feedback'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<FeedbackIcon />}
          onClick={() => setShowNewFeedback(true)}
        >
          {isRTL ? 'ملاحظة جديدة' : 'New Feedback'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {myFeedback.map((feedback) => (
          <Grid item xs={12} key={feedback.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {feedback.title}
                    </Typography>
                    <Box display="flex" gap={1} mb={1}>
                      <Chip
                        icon={categories.find(c => c.value === feedback.category)?.icon}
                        label={categories.find(c => c.value === feedback.category)?.label}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={ministries.find(m => m.value === feedback.ministry)?.label}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    {feedback.rating > 0 && (
                      <Rating value={feedback.rating} readOnly size="small" />
                    )}
                  </Box>
                  <Chip
                    label={getStatusLabel(feedback.status)}
                    color={getStatusColor(feedback.status)}
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {isRTL ? 'تاريخ الإرسال' : 'Submitted'}: {new Date(feedback.date).toLocaleDateString()}
                </Typography>
                
                {feedback.response && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {isRTL ? 'الرد' : 'Response'}:
                    </Typography>
                    {feedback.response}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderPublicFeedbackTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'آراء المواطنين العامة' : 'Public Citizen Feedback'}
      </Typography>
      
      <Grid container spacing={3}>
        {publicFeedback.map((feedback) => (
          <Grid item xs={12} key={feedback.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {feedback.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        {isRTL ? 'بواسطة' : 'By'}: {feedback.author}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(feedback.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                      {feedback.content}
                    </Typography>
                    {feedback.rating > 0 && (
                      <Rating value={feedback.rating} readOnly size="small" />
                    )}
                  </Box>
                  <Chip
                    label={ministries.find(m => m.value === feedback.ministry)?.label}
                    color="primary"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" gap={2}>
                    <Button startIcon={<ThumbUpIcon />} size="small">
                      {feedback.likes}
                    </Button>
                    <Button startIcon={<CommentIcon />} size="small">
                      {feedback.responses} {isRTL ? 'تعليق' : 'responses'}
                    </Button>
                  </Box>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderSurveysTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'الاستبيانات المتاحة' : 'Available Surveys'}
      </Typography>
      
      <Grid container spacing={3}>
        {surveys.map((survey) => (
          <Grid item xs={12} md={6} key={survey.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    {survey.title}
                  </Typography>
                  {survey.completed && (
                    <Chip icon={<CompleteIcon />} label={isRTL ? 'مكتمل' : 'Completed'} color="success" />
                  )}
                </Box>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {survey.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      {isRTL ? 'الأسئلة' : 'Questions'}
                    </Typography>
                    <Typography variant="body2">
                      {survey.questions} {isRTL ? 'سؤال' : 'questions'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">
                      {isRTL ? 'المدة المقدرة' : 'Est. Duration'}
                    </Typography>
                    <Typography variant="body2">
                      {survey.duration} {isRTL ? 'دقائق' : 'minutes'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={`${isRTL ? 'مكافأة' : 'Reward'}: ${survey.reward}`}
                    color="primary"
                    size="small"
                  />
                  <Button
                    variant={survey.completed ? "outlined" : "contained"}
                    disabled={survey.completed}
                    startIcon={<SurveyIcon />}
                  >
                    {survey.completed ? 
                      (isRTL ? 'تم الإكمال' : 'Completed') : 
                      (isRTL ? 'ابدأ الاستبيان' : 'Start Survey')
                    }
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'إحصائيات نظام الملاحظات' : 'Feedback System Analytics'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'تصنيف الملاحظات' : 'Feedback Categories'}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(analytics.categoryBreakdown || {}).map(([category, percentage]) => {
                  const categoryInfo = categories.find(c => c.value === category);
                  return (
                    <Grid item xs={12} key={category}>
                      <Box display="flex" alignItems="center" mb={1}>
                        {categoryInfo?.icon}
                        <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
                          {categoryInfo?.label || category}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'الملخص' : 'Summary'}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'متوسط الاستجابة' : 'Avg Response Time'}
                    secondary={`${analytics.avgResponseTime} ${isRTL ? 'أيام' : 'days'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StarIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'درجة الرضا' : 'Satisfaction'}
                    secondary={`${analytics.satisfactionScore}/5`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CompleteIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'معدل الحل' : 'Resolution Rate'}
                    secondary={`${((analytics.resolvedFeedback / analytics.totalFeedback) * 100).toFixed(1)}%`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center">
          <FeedbackIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              {isRTL ? 'نظام ملاحظات المواطنين' : 'Citizen Feedback System'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {isRTL ? 'شاركنا رأيك وساعدنا في التحسين' : 'Share your opinion and help us improve'}
            </Typography>
          </Box>
        </Box>

        <Fab
          color="primary"
          onClick={() => setShowNewFeedback(true)}
          sx={{ position: 'fixed', bottom: 24, right: isRTL ? 'auto' : 24, left: isRTL ? 24 : 'auto' }}
        >
          <FeedbackIcon />
        </Fab>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={isRTL ? 'نظرة عامة' : 'Overview'} />
          <Tab label={isRTL ? 'ملاحظاتي' : 'My Feedback'} />
          <Tab label={isRTL ? 'آراء عامة' : 'Public Feedback'} />
          <Tab label={isRTL ? 'الاستبيانات' : 'Surveys'} />
          <Tab label={isRTL ? 'الإحصائيات' : 'Analytics'} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderMyFeedbackTab()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderPublicFeedbackTab()}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {renderSurveysTab()}
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {renderAnalyticsTab()}
      </TabPanel>

      {/* New Feedback Form Dialog */}
      {renderNewFeedbackForm()}
    </Box>
  );
};

export default CitizenFeedbackSystem;