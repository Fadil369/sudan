import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Tooltip,
  Badge,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  LocalFireDepartment,
  TrendingUp,
  Speed,
  Psychology,
  Group,
  Assignment,
  Verified,
  Diamond,
  Military,
  Shield,
  Celebration,
  Rocket,
  Flag,
  AccountTree,
  School,
  LocalHospital,
  AccountBalance,
  Agriculture,
  ElectricBolt,
  Work,
  Close,
  Timer,
  CheckCircle,
  Lock,
  PlayArrow,
  Pause,
  Refresh
} from '@mui/icons-material';

// Achievement tiers and rarities
const ACHIEVEMENT_TIERS = {
  BRONZE: { color: '#cd7f32', label: { en: 'Bronze', ar: 'برونزي' }, points: 10 },
  SILVER: { color: '#c0c0c0', label: { en: 'Silver', ar: 'فضي' }, points: 25 },
  GOLD: { color: '#ffd700', label: { en: 'Gold', ar: 'ذهبي' }, points: 50 },
  PLATINUM: { color: '#e5e4e2', label: { en: 'Platinum', ar: 'بلاتيني' }, points: 100 },
  DIAMOND: { color: '#b9f2ff', label: { en: 'Diamond', ar: 'ماسي' }, points: 200 }
};

// Quest definitions for government services
const QUESTS = [
  {
    id: 'new_citizen',
    title: { en: 'Digital Citizen', ar: 'المواطن الرقمي' },
    description: { en: 'Complete your first government service', ar: 'أكمل أول خدمة حكومية' },
    icon: <Verified />,
    color: '#10b981',
    tier: 'BRONZE',
    xpReward: 50,
    steps: [
      { id: 'login', title: { en: 'Log into portal', ar: 'تسجيل الدخول' }, completed: true },
      { id: 'profile', title: { en: 'Complete profile', ar: 'إكمال الملف الشخصي' }, completed: false },
      { id: 'service', title: { en: 'Use a service', ar: 'استخدام خدمة' }, completed: false }
    ],
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    category: 'onboarding'
  },
  {
    id: 'service_explorer',
    title: { en: 'Service Explorer', ar: 'مستكشف الخدمات' },
    description: { en: 'Visit 5 different government departments', ar: 'زيارة 5 أقسام حكومية مختلفة' },
    icon: <AccountTree />,
    color: '#6366f1',
    tier: 'SILVER',
    xpReward: 100,
    steps: [
      { id: 'dept1', title: { en: 'Visit Health Dept', ar: 'زيارة وزارة الصحة' }, completed: true },
      { id: 'dept2', title: { en: 'Visit Education Dept', ar: 'زيارة وزارة التعليم' }, completed: true },
      { id: 'dept3', title: { en: 'Visit Finance Dept', ar: 'زيارة وزارة المالية' }, completed: false },
      { id: 'dept4', title: { en: 'Visit Agriculture Dept', ar: 'زيارة وزارة الزراعة' }, completed: false },
      { id: 'dept5', title: { en: 'Visit Labor Dept', ar: 'زيارة وزارة العمل' }, completed: false }
    ],
    timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days
    category: 'exploration'
  },
  {
    id: 'power_user',
    title: { en: 'Power User', ar: 'المستخدم المتقدم' },
    description: { en: 'Complete 25 government transactions', ar: 'إكمال 25 معاملة حكومية' },
    icon: <LocalFireDepartment />,
    color: '#f59e0b',
    tier: 'GOLD',
    xpReward: 250,
    steps: [
      { id: 'trans5', title: { en: '5 Transactions', ar: '5 معاملات' }, completed: true },
      { id: 'trans10', title: { en: '10 Transactions', ar: '10 معاملات' }, completed: true },
      { id: 'trans15', title: { en: '15 Transactions', ar: '15 معاملة' }, completed: false },
      { id: 'trans20', title: { en: '20 Transactions', ar: '20 معاملة' }, completed: false },
      { id: 'trans25', title: { en: '25 Transactions', ar: '25 معاملة' }, completed: false }
    ],
    timeLimit: 30 * 24 * 60 * 60 * 1000, // 30 days
    category: 'usage'
  },
  {
    id: 'feedback_champion',
    title: { en: 'Feedback Champion', ar: 'بطل التغذية الراجعة' },
    description: { en: 'Provide helpful feedback 10 times', ar: 'تقديم تعليقات مفيدة 10 مرات' },
    icon: <Psychology />,
    color: '#8b5cf6',
    tier: 'SILVER',
    xpReward: 150,
    steps: [
      { id: 'feedback3', title: { en: '3 Feedback', ar: '3 تعليقات' }, completed: true },
      { id: 'feedback5', title: { en: '5 Feedback', ar: '5 تعليقات' }, completed: false },
      { id: 'feedback10', title: { en: '10 Feedback', ar: '10 تعليقات' }, completed: false }
    ],
    timeLimit: 14 * 24 * 60 * 60 * 1000, // 14 days
    category: 'community'
  },
  {
    id: 'biometric_master',
    title: { en: 'Biometric Master', ar: 'خبير القياسات الحيوية' },
    description: { en: 'Complete biometric verification for all services', ar: 'إكمال التحقق البيومتري لجميع الخدمات' },
    icon: <Shield />,
    color: '#dc2626',
    tier: 'PLATINUM',
    xpReward: 500,
    steps: [
      { id: 'fingerprint', title: { en: 'Fingerprint Setup', ar: 'إعداد البصمة' }, completed: true },
      { id: 'face', title: { en: 'Face Recognition', ar: 'التعرف على الوجه' }, completed: false },
      { id: 'iris', title: { en: 'Iris Scan', ar: 'مسح القزحية' }, completed: false },
      { id: 'voice', title: { en: 'Voice Print', ar: 'بصمة الصوت' }, completed: false }
    ],
    timeLimit: 60 * 24 * 60 * 60 * 1000, // 60 days
    category: 'security'
  }
];

// Daily challenges
const DAILY_CHALLENGES = [
  {
    id: 'daily_login',
    title: { en: 'Daily Check-in', ar: 'تسجيل الدخول اليومي' },
    description: { en: 'Log into the portal', ar: 'تسجيل الدخول للبوابة' },
    xpReward: 10,
    completed: false,
    type: 'simple'
  },
  {
    id: 'service_today',
    title: { en: 'Today\'s Service', ar: 'خدمة اليوم' },
    description: { en: 'Use any government service today', ar: 'استخدم أي خدمة حكومية اليوم' },
    xpReward: 25,
    completed: false,
    type: 'action'
  },
  {
    id: 'help_citizen',
    title: { en: 'Community Helper', ar: 'مساعد المجتمع' },
    description: { en: 'Rate or review a service', ar: 'قيم أو راجع خدمة' },
    xpReward: 15,
    completed: true,
    type: 'community'
  }
];

// Leaderboard categories
const LEADERBOARD_CATEGORIES = [
  { id: 'overall', label: { en: 'Overall', ar: 'العام' }, icon: <EmojiEvents /> },
  { id: 'weekly', label: { en: 'This Week', ar: 'هذا الأسبوع' }, icon: <TrendingUp /> },
  { id: 'services', label: { en: 'Services Used', ar: 'الخدمات المستخدمة' }, icon: <Assignment /> },
  { id: 'community', label: { en: 'Community', ar: 'المجتمع' }, icon: <Group /> }
];

const GamificationSystem = ({ 
  isRTL = false, 
  userProfile = {}, 
  onQuestComplete, 
  onLevelUp,
  onAchievementUnlock 
}) => {
  const [userStats, setUserStats] = useState({
    level: 5,
    xp: 1250,
    totalXp: 1250,
    streak: 7,
    rank: 'Gold Citizen',
    achievements: ['new_citizen', 'service_explorer'],
    completedQuests: [],
    badges: [],
    ...userProfile
  });

  const [activeQuests, setActiveQuests] = useState(QUESTS.slice(0, 3));
  const [dailyChallenges, setDailyChallenges] = useState(DAILY_CHALLENGES);
  const [selectedTab, setSelectedTab] = useState('quests');
  const [questDialogOpen, setQuestDialogOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [showXpGain, setShowXpGain] = useState(null);

  // Calculate level from XP (100 XP per level)
  const calculateLevel = (xp) => Math.floor(xp / 100) + 1;
  const calculateXpForNextLevel = (xp) => (calculateLevel(xp) * 100) - xp;
  const calculateProgressToNextLevel = (xp) => ((xp % 100) / 100) * 100;

  // Generate mock leaderboard
  useEffect(() => {
    const mockLeaderboard = [
      { id: 1, name: 'Ahmed Al-Bashir', level: 12, xp: 2150, avatar: '👨', rank: 'Diamond Citizen' },
      { id: 2, name: 'Fatima Hassan', level: 10, xp: 1890, avatar: '👩', rank: 'Platinum Citizen' },
      { id: 3, name: 'Omar Khalil', level: 8, xp: 1450, avatar: '👨', rank: 'Gold Citizen' },
      { id: 4, name: 'Amina Mohamed', level: 7, xp: 1320, avatar: '👩', rank: 'Gold Citizen' },
      { id: 5, name: 'You', level: userStats.level, xp: userStats.xp, avatar: '👤', rank: userStats.rank, isUser: true }
    ];
    setLeaderboard(mockLeaderboard.sort((a, b) => b.xp - a.xp));
  }, [userStats.level, userStats.xp, userStats.rank]);

  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
    setQuestDialogOpen(true);
  };

  const handleCompleteQuestStep = (questId, stepId) => {
    setActiveQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        const updatedSteps = quest.steps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        );
        
        const allStepsCompleted = updatedSteps.every(step => step.completed);
        
        if (allStepsCompleted && !userStats.completedQuests.includes(questId)) {
          // Quest completed!
          const xpGain = quest.xpReward;
          const newXp = userStats.xp + xpGain;
          const oldLevel = userStats.level;
          const newLevel = calculateLevel(newXp);
          
          setUserStats(prev => ({
            ...prev,
            xp: newXp,
            totalXp: prev.totalXp + xpGain,
            level: newLevel,
            completedQuests: [...prev.completedQuests, questId]
          }));
          
          // Show XP gain animation
          setShowXpGain({ amount: xpGain, quest: quest.title[isRTL ? 'ar' : 'en'] });
          setTimeout(() => setShowXpGain(null), 3000);
          
          // Check for level up
          if (newLevel > oldLevel) {
            setShowLevelUpAnimation(true);
            setTimeout(() => setShowLevelUpAnimation(false), 4000);
            if (onLevelUp) onLevelUp(newLevel);
          }
          
          if (onQuestComplete) onQuestComplete(quest);
        }
        
        return { ...quest, steps: updatedSteps };
      }
      return quest;
    }));
  };

  const handleCompleteDailyChallenge = (challengeId) => {
    setDailyChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const xpGain = challenge.xpReward;
        const newXp = userStats.xp + xpGain;
        
        setUserStats(prevStats => ({
          ...prevStats,
          xp: newXp,
          totalXp: prevStats.totalXp + xpGain,
          level: calculateLevel(newXp),
          streak: challenge.id === 'daily_login' ? prevStats.streak + 1 : prevStats.streak
        }));
        
        setShowXpGain({ amount: xpGain, quest: challenge.title[isRTL ? 'ar' : 'en'] });
        setTimeout(() => setShowXpGain(null), 3000);
        
        return { ...challenge, completed: true };
      }
      return challenge;
    }));
  };

  // XP Gain Animation Component
  const XpGainAnimation = () => {
    if (!showXpGain) return null;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <Zoom in={!!showXpGain}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
              border: '2px solid #ffffff',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              minWidth: 200,
              animation: 'xpFloat 3s ease-out forwards',
              '@keyframes xpFloat': {
                '0%': {
                  transform: 'scale(0.8) translateY(20px)',
                  opacity: 0
                },
                '20%': {
                  transform: 'scale(1.2) translateY(0px)',
                  opacity: 1
                },
                '80%': {
                  transform: 'scale(1) translateY(-10px)',
                  opacity: 1
                },
                '100%': {
                  transform: 'scale(0.9) translateY(-30px)',
                  opacity: 0
                }
              }
            }}
          >
            <Star sx={{ fontSize: 40, color: 'white', mb: 1 }} />
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              +{showXpGain.amount} XP
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              {showXpGain.quest}
            </Typography>
          </Card>
        </Zoom>
      </Box>
    );
  };

  // Level Up Animation Component
  const LevelUpAnimation = () => {
    if (!showLevelUpAnimation) return null;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none'
        }}
      >
        <Fade in={showLevelUpAnimation}>
          <Box textAlign="center">
            <Box
              sx={{
                fontSize: 120,
                mb: 2,
                animation: 'levelUpPulse 2s ease-in-out infinite'
              }}
            >
              🎉
            </Box>
            <Typography
              variant="h2"
              sx={{
                color: '#ffd700',
                fontWeight: 700,
                mb: 2,
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                animation: 'levelUpGlow 2s ease-in-out infinite',
                '@keyframes levelUpPulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                },
                '@keyframes levelUpGlow': {
                  '0%, 100%': { textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
                  '50%': { textShadow: '0 0 40px rgba(255, 215, 0, 0.8)' }
                }
              }}
            >
              {isRTL ? 'مستوى جديد!' : 'LEVEL UP!'}
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
              {isRTL ? `المستوى ${userStats.level}` : `Level ${userStats.level}`}
            </Typography>
            <Chip
              label={userStats.rank}
              sx={{
                mt: 2,
                backgroundColor: '#ffd700',
                color: 'black',
                fontWeight: 600,
                fontSize: '1rem',
                px: 2,
                py: 0.5
              }}
            />
          </Box>
        </Fade>
      </Box>
    );
  };

  return (
    <Box>
      {/* XP and Level Up Animations */}
      <XpGainAnimation />
      <LevelUpAnimation />

      {/* User Profile Card */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: 2,
          mb: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, ${ACHIEVEMENT_TIERS.GOLD.color} 0%, ${ACHIEVEMENT_TIERS.PLATINUM.color} 100%)`,
                    fontSize: '2rem',
                    mb: 2
                  }}
                >
                  👤
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                  {isRTL ? `المستوى ${userStats.level}` : `Level ${userStats.level}`}
                </Typography>
                <Chip
                  label={userStats.rank}
                  sx={{
                    backgroundColor: ACHIEVEMENT_TIERS.GOLD.color,
                    color: 'black',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {isRTL ? 'التقدم إلى المستوى التالي' : 'Progress to Next Level'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                    {userStats.xp}/{calculateLevel(userStats.xp) * 100} XP
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgressToNextLevel(userStats.xp)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)',
                      borderRadius: 6
                    }
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1 }}>
                  {isRTL ? `${calculateXpForNextLevel(userStats.xp)} نقطة متبقية` : `${calculateXpForNextLevel(userStats.xp)} XP to next level`}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                      {userStats.streak}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {isRTL ? 'أيام متتالية' : 'Day Streak'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                      {userStats.completedQuests.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {isRTL ? 'مهام مكتملة' : 'Quests Done'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {[
          { id: 'quests', label: { en: 'Active Quests', ar: 'المهام النشطة' }, icon: <Assignment /> },
          { id: 'daily', label: { en: 'Daily Challenges', ar: 'التحديات اليومية' }, icon: <Timer /> },
          { id: 'achievements', label: { en: 'Achievements', ar: 'الإنجازات' }, icon: <EmojiEvents /> },
          { id: 'leaderboard', label: { en: 'Leaderboard', ar: 'لوحة الصدارة' }, icon: <TrendingUp /> }
        ].map(tab => (
          <Grid item xs={6} md={3} key={tab.id}>
            <Button
              fullWidth
              variant={selectedTab === tab.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab(tab.id)}
              startIcon={tab.icon}
              sx={{
                py: 1.5,
                backgroundColor: selectedTab === tab.id ? '#0ea5e9' : 'transparent',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: selectedTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  borderColor: '#0ea5e9',
                  backgroundColor: selectedTab === tab.id ? '#0284c7' : 'rgba(14, 165, 233, 0.1)'
                }
              }}
            >
              {tab.label[isRTL ? 'ar' : 'en']}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Active Quests Tab */}
      {selectedTab === 'quests' && (
        <Grid container spacing={3}>
          {activeQuests.map(quest => {
            const completedSteps = quest.steps.filter(step => step.completed).length;
            const progress = (completedSteps / quest.steps.length) * 100;
            const isCompleted = userStats.completedQuests.includes(quest.id);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={quest.id}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${quest.color}20 0%, ${quest.color}05 100%)`,
                    border: `2px solid ${isCompleted ? '#10b981' : quest.color}40`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${quest.color}30`
                    }
                  }}
                  onClick={() => handleQuestClick(quest)}
                >
                  {isCompleted && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1
                      }}
                    >
                      <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                    </Box>
                  )}
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        sx={{
                          backgroundColor: quest.color,
                          width: 50,
                          height: 50
                        }}
                      >
                        {quest.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                          {quest.title[isRTL ? 'ar' : 'en']}
                        </Typography>
                        <Chip
                          label={ACHIEVEMENT_TIERS[quest.tier].label[isRTL ? 'ar' : 'en']}
                          size="small"
                          sx={{
                            backgroundColor: `${ACHIEVEMENT_TIERS[quest.tier].color}30`,
                            color: ACHIEVEMENT_TIERS[quest.tier].color,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}
                    >
                      {quest.description[isRTL ? 'ar' : 'en']}
                    </Typography>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {isRTL ? 'التقدم' : 'Progress'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: quest.color, fontWeight: 600 }}>
                          {completedSteps}/{quest.steps.length}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: quest.color,
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                          {quest.xpReward} XP
                        </Typography>
                      </Box>
                      {!isCompleted && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            backgroundColor: quest.color,
                            '&:hover': { opacity: 0.8 }
                          }}
                        >
                          {isRTL ? 'متابعة' : 'Continue'}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Daily Challenges Tab */}
      {selectedTab === 'daily' && (
        <Grid container spacing={3}>
          {dailyChallenges.map(challenge => (
            <Grid item xs={12} md={4} key={challenge.id}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
                  border: `2px solid ${challenge.completed ? '#10b981' : '#f59e0b'}40`,
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {challenge.title[isRTL ? 'ar' : 'en']}
                    </Typography>
                    {challenge.completed ? (
                      <CheckCircle sx={{ color: '#10b981' }} />
                    ) : (
                      <Timer sx={{ color: '#f59e0b' }} />
                    )}
                  </Box>
                  
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}
                  >
                    {challenge.description[isRTL ? 'ar' : 'en']}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {challenge.xpReward} XP
                      </Typography>
                    </Box>
                    
                    {!challenge.completed && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleCompleteDailyChallenge(challenge.id)}
                        sx={{
                          backgroundColor: '#f59e0b',
                          '&:hover': { backgroundColor: '#d97706' }
                        }}
                      >
                        {isRTL ? 'إكمال' : 'Complete'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quest Detail Dialog */}
      {selectedQuest && (
        <Dialog
          open={questDialogOpen}
          onClose={() => setQuestDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: `linear-gradient(135deg, ${selectedQuest.color}20 0%, rgba(0, 0, 0, 0.95) 100%)`,
              backdropFilter: 'blur(20px)',
              border: `2px solid ${selectedQuest.color}`,
              borderRadius: 2,
              color: 'white'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    backgroundColor: selectedQuest.color,
                    width: 50,
                    height: 50
                  }}
                >
                  {selectedQuest.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {selectedQuest.title[isRTL ? 'ar' : 'en']}
                  </Typography>
                  <Chip
                    label={ACHIEVEMENT_TIERS[selectedQuest.tier].label[isRTL ? 'ar' : 'en']}
                    sx={{
                      backgroundColor: ACHIEVEMENT_TIERS[selectedQuest.tier].color,
                      color: 'black',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setQuestDialogOpen(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
              {selectedQuest.description[isRTL ? 'ar' : 'en']}
            </Typography>

            <Stepper orientation="vertical">
              {selectedQuest.steps.map((step, index) => (
                <Step key={step.id} active={true} completed={step.completed}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { 
                        color: step.completed ? '#10b981' : 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem'
                      },
                      '& .MuiStepIcon-root': { 
                        color: step.completed ? '#10b981' : selectedQuest.color 
                      }
                    }}
                  >
                    {step.title[isRTL ? 'ar' : 'en']}
                  </StepLabel>
                  <StepContent>
                    {!step.completed && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleCompleteQuestStep(selectedQuest.id, step.id)}
                        sx={{
                          backgroundColor: selectedQuest.color,
                          mt: 1,
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        {isRTL ? 'إكمال الخطوة' : 'Complete Step'}
                      </Button>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Star sx={{ color: '#fbbf24' }} />
                <Typography sx={{ color: 'white', fontWeight: 600 }}>
                  {selectedQuest.xpReward} XP {isRTL ? 'مكافأة' : 'Reward'}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={() => setQuestDialogOpen(false)}
              variant="outlined"
              sx={{
                borderColor: selectedQuest.color,
                color: selectedQuest.color
              }}
            >
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Development Controls */}
      {process.env.NODE_ENV === 'development' && (
        <Card sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
            Development Tools:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              onClick={() => {
                const xpGain = 100;
                const newXp = userStats.xp + xpGain;
                setUserStats(prev => ({
                  ...prev,
                  xp: newXp,
                  totalXp: prev.totalXp + xpGain,
                  level: calculateLevel(newXp)
                }));
                setShowXpGain({ amount: xpGain, quest: 'Test XP' });
                setTimeout(() => setShowXpGain(null), 3000);
              }}
              sx={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'white' }}
            >
              +100 XP
            </Button>
            <Button
              size="small"
              onClick={() => {
                setShowLevelUpAnimation(true);
                setTimeout(() => setShowLevelUpAnimation(false), 4000);
              }}
              sx={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'white' }}
            >
              Test Level Up
            </Button>
            <Button
              size="small"
              onClick={() => {
                setDailyChallenges(prev => prev.map(c => ({ ...c, completed: false })));
              }}
              sx={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'white' }}
            >
              Reset Daily
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default GamificationSystem;