import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  School,
  MenuBook,
  EmojiEvents,
  Assignment,
  VideoLibrary,
  Download,
  Upload,
  Verified,
  Star,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import PremiumServiceCard from './shared/PremiumServiceCard';
import PremiumStatsCard from './shared/PremiumStatsCard';

export default function EducationMinistryPortal({ language = 'en' }) {
  const isRTL = language === 'ar';
  const [currentTab, setCurrentTab] = useState(0);

  const studentProfile = {
    name: 'Ahmed Mohammed',
    studentId: 'EDU-2024-001234',
    grade: 'Grade 11',
    school: 'Khartoum Secondary School',
    gpa: 3.85,
    attendance: 94,
    avatar: '👨‍🎓',
  };

  const academicStats = {
    gpa: 3.85,
    courses: 6,
    completed: 45,
    certificates: 3,
  };

  const currentCourses = [
    {
      name: 'Advanced Mathematics',
      code: 'MATH301',
      instructor: 'Prof. Sarah Ibrahim',
      progress: 78,
      grade: 'A-',
      nextClass: 'Tomorrow, 9:00 AM',
      color: '#2563eb',
    },
    {
      name: 'Physics',
      code: 'PHY201',
      instructor: 'Dr. Omar Hassan',
      progress: 65,
      grade: 'B+',
      nextClass: 'Today, 2:00 PM',
      color: '#16a34a',
    },
    {
      name: 'Chemistry',
      code: 'CHEM201',
      instructor: 'Dr. Amira Ahmed',
      progress: 82,
      grade: 'A',
      nextClass: 'Friday, 10:30 AM',
      color: '#7c3aed',
    },
  ];

  const achievements = [
    {
      title: 'Honor Roll',
      description: '3 consecutive semesters',
      icon: '🏆',
      date: '2026-02-01',
      color: '#eab308',
    },
    {
      title: 'Science Fair Winner',
      description: 'First place - Regional competition',
      icon: '🥇',
      date: '2025-12-15',
      color: '#2563eb',
    },
    {
      title: 'Perfect Attendance',
      description: 'Fall semester 2025',
      icon: '📅',
      date: '2026-01-10',
      color: '#16a34a',
    },
  ];

  const certificates = [
    {
      title: 'Secondary School Certificate',
      issueDate: '2025-06-30',
      certificateId: 'SEC-2025-1234',
      verified: true,
    },
    {
      title: 'Computer Science Basics',
      issueDate: '2025-09-15',
      certificateId: 'CS-2025-5678',
      verified: true,
    },
  ];

  const services = [
    {
      title: isRTL ? 'السجل الأكاديمي' : 'Academic Transcript',
      description: isRTL
        ? 'عرض وتنزيل سجلك الأكاديمي الرسمي'
        : 'View and download your official academic records',
      icon: Assignment,
      color: '#2563eb',
      featured: true,
      stats: [
        { value: studentProfile.gpa, label: isRTL ? 'المعدل' : 'GPA' },
        { value: academicStats.completed, label: isRTL ? 'ساعة' : 'Credits' },
      ],
      actions: [
        {
          label: isRTL ? 'تنزيل الشهادة' : 'Download Transcript',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'الدورات الحالية' : 'Current Courses',
      description: isRTL
        ? 'متابعة تقدمك في المواد الدراسية'
        : 'Track your progress in enrolled courses',
      icon: MenuBook,
      color: '#16a34a',
      badge: `${academicStats.courses} ${isRTL ? 'مواد' : 'Active'}`,
      stats: [
        { value: academicStats.courses, label: isRTL ? 'مواد' : 'Courses' },
      ],
      actions: [
        {
          label: isRTL ? 'عرض المواد' : 'View Courses',
          onClick: () => setCurrentTab(1),
        },
      ],
    },
    {
      title: isRTL ? 'الشهادات' : 'Certificates',
      description: isRTL
        ? 'شهاداتك الرسمية المعتمدة'
        : 'Your verified official certificates',
      icon: Verified,
      color: '#7c3aed',
      badge: `${certificates.length} ${isRTL ? 'معتمدة' : 'Verified'}`,
      featured: true,
      actions: [
        {
          label: isRTL ? 'عرض الشهادات' : 'View All',
          onClick: () => setCurrentTab(2),
        },
      ],
    },
    {
      title: isRTL ? 'المكتبة الرقمية' : 'Digital Library',
      description: isRTL
        ? 'الوصول إلى آلاف الكتب والموارد التعليمية'
        : 'Access thousands of books and learning resources',
      icon: VideoLibrary,
      color: '#dc2626',
      stats: [
        { value: '10K+', label: isRTL ? 'كتاب' : 'Books' },
      ],
      actions: [
        {
          label: isRTL ? 'تصفح المكتبة' : 'Browse Library',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'التسجيل' : 'Enrollment',
      description: isRTL
        ? 'التسجيل في الفصول والدورات الجديدة'
        : 'Register for new semesters and courses',
      icon: School,
      color: '#0891b2',
      actions: [
        {
          label: isRTL ? 'التسجيل الآن' : 'Enroll Now',
          onClick: () => {},
        },
      ],
    },
    {
      title: isRTL ? 'المنح الدراسية' : 'Scholarships',
      description: isRTL
        ? 'استكشف فرص المنح المتاحة'
        : 'Explore available scholarship opportunities',
      icon: EmojiEvents,
      color: '#ea580c',
      badge: isRTL ? '5 متاحة' : '5 Available',
      actions: [
        {
          label: isRTL ? 'عرض المنح' : 'View Offers',
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Hero Section with Student Profile */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '3rem',
                  bgcolor: 'rgba(255,255,255,0.2)',
                }}
              >
                {studentProfile.avatar}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {studentProfile.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {studentProfile.studentId}
                </Typography>
                <Chip
                  label={studentProfile.grade}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'المعدل' : 'GPA'}
                  value={studentProfile.gpa}
                  subtitle="/ 4.0"
                  icon={Star}
                  color="#eab308"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الحضور' : 'Attendance'}
                  value={`${studentProfile.attendance}%`}
                  icon={CalendarToday}
                  color="#16a34a"
                  variant="gradient"
                  trend={{ value: '+2%', direction: 'up' }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'المواد' : 'Courses'}
                  value={academicStats.courses}
                  subtitle={isRTL ? 'نشطة' : 'Active'}
                  icon={MenuBook}
                  color="#2563eb"
                  variant="gradient"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PremiumStatsCard
                  title={isRTL ? 'الإنجازات' : 'Achievements'}
                  value={achievements.length}
                  icon={EmojiEvents}
                  color="#7c3aed"
                  variant="gradient"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

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
          <Tab label={isRTL ? 'المواد الدراسية' : 'Current Courses'} />
          <Tab label={isRTL ? 'الشهادات' : 'Certificates'} />
          <Tab label={isRTL ? 'الإنجازات' : 'Achievements'} />
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

          {/* Courses Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'المواد الدراسية الحالية' : 'Current Courses'}
              </Typography>
              <Grid container spacing={3}>
                {currentCourses.map((course, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #e5e7eb',
                        '&:hover': {
                          borderColor: course.color,
                          boxShadow: `0 4px 12px ${course.color}20`,
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {course.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.code} • {course.instructor}
                          </Typography>
                        </Box>
                        <Chip
                          label={course.grade}
                          sx={{
                            bgcolor: `${course.color}15`,
                            color: course.color,
                            fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        />
                      </Box>

                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">
                            {isRTL ? 'التقدم' : 'Progress'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: course.color }}>
                            {course.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={course.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${course.color}20`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              bgcolor: course.color,
                            },
                          }}
                        />
                      </Box>

                      <Box display="flex" gap={1} mt={2}>
                        <Chip
                          icon={<CalendarToday />}
                          label={course.nextClass}
                          size="small"
                          variant="outlined"
                        />
                        <Button size="small" variant="outlined">
                          {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Certificates Tab */}
          {currentTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isRTL ? 'الشهادات الرسمية' : 'Official Certificates'}
                </Typography>
                <Button variant="outlined" startIcon={<Upload />}>
                  {isRTL ? 'طلب شهادة' : 'Request Certificate'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {certificates.map((cert, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid #16a34a',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {cert.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {cert.certificateId}
                          </Typography>
                        </Box>
                        <Verified sx={{ color: '#16a34a', fontSize: 32 }} />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}: {cert.issueDate}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Download />}
                          sx={{
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          }}
                        >
                          {isRTL ? 'تنزيل' : 'Download'}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Achievements Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                {isRTL ? 'الإنجازات والجوائز' : 'Achievements & Awards'}
              </Typography>

              <Grid container spacing={2}>
                {achievements.map((achievement, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card
                      sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${achievement.color}10 0%, #ffffff 100%)`,
                        border: `2px solid ${achievement.color}30`,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Box textAlign="center" mb={2}>
                          <Typography sx={{ fontSize: '4rem' }}>
                            {achievement.icon}
                          </Typography>
                        </Box>
                        <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                          {achievement.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                          {achievement.description}
                        </Typography>
                        <Chip
                          label={achievement.date}
                          size="small"
                          sx={{
                            mt: 2,
                            display: 'block',
                            mx: 'auto',
                            width: 'fit-content',
                          }}
                        />
                      </CardContent>
                    </Card>
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
