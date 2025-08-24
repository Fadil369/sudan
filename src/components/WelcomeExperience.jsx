import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Confetti,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Star,
  EmojiEvents,
  Verified,
  LocalFireDepartment,
  Celebration,
  Close,
  PlayArrow,
  VolumeUp,
  VolumeOff,
  Flag,
  AccountTree,
  School,
  LocalHospital,
  Work,
  Agriculture
} from '@mui/icons-material';

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_LOGIN: {
    id: 'first_login',
    title: { en: 'Welcome to Sudan!', ar: 'مرحباً بك في السودان!' },
    description: { en: 'Completed your first login', ar: 'قمت بتسجيل الدخول لأول مرة' },
    icon: <Flag />,
    color: '#dc2626',
    points: 10,
    rarity: 'common'
  },
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    title: { en: 'Digital Citizen', ar: 'مواطن رقمي' },
    description: { en: 'Completed your profile setup', ar: 'أكملت إعداد ملفك الشخصي' },
    icon: <Verified />,
    color: '#10b981',
    points: 25,
    rarity: 'uncommon'
  },
  FIRST_SERVICE: {
    id: 'first_service',
    title: { en: 'Service Pioneer', ar: 'رائد الخدمات' },
    description: { en: 'Used your first government service', ar: 'استخدمت أول خدمة حكومية' },
    icon: <AccountTree />,
    color: '#6366f1',
    points: 20,
    rarity: 'uncommon'
  },
  MULTI_DEPT: {
    id: 'multi_dept',
    title: { en: 'Explorer', ar: 'مستكشف' },
    description: { en: 'Visited 3+ different departments', ar: 'زرت 3 أقسام مختلفة أو أكثر' },
    icon: <EmojiEvents />,
    color: '#f59e0b',
    points: 50,
    rarity: 'rare'
  },
  POWER_USER: {
    id: 'power_user',
    title: { en: 'Power User', ar: 'مستخدم متقدم' },
    description: { en: 'Completed 10+ transactions', ar: 'أكملت 10 معاملات أو أكثر' },
    icon: <LocalFireDepartment />,
    color: '#8b5cf6',
    points: 100,
    rarity: 'epic'
  },
  COMMUNITY_HELPER: {
    id: 'community_helper',
    title: { en: 'Community Helper', ar: 'مساعد المجتمع' },
    description: { en: 'Provided feedback 5+ times', ar: 'قدمت الملاحظات 5 مرات أو أكثر' },
    icon: <Celebration />,
    color: '#be185d',
    points: 75,
    rarity: 'rare'
  }
};

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: { en: 'Welcome to Sudan Digital Portal', ar: 'مرحباً ببوابة السودان الرقمية' },
    description: { en: 'Your gateway to all government services in one place', ar: 'بوابتك لجميع الخدمات الحكومية في مكان واحد' },
    icon: <Flag />,
    color: '#dc2626',
    animation: 'fadeIn'
  },
  {
    id: 'services',
    title: { en: 'Explore Government Services', ar: 'استكشف الخدمات الحكومية' },
    description: { en: 'Access health, education, finance, and more', ar: 'احصل على خدمات الصحة والتعليم والمالية وأكثر' },
    icon: <AccountTree />,
    color: '#10b981',
    animation: 'slideIn'
  },
  {
    id: 'profile',
    title: { en: 'Complete Your Digital Identity', ar: 'أكمل هويتك الرقمية' },
    description: { en: 'Set up your secure citizen profile', ar: 'أنشئ ملفك الشخصي الآمن' },
    icon: <Verified />,
    color: '#6366f1',
    animation: 'zoomIn'
  },
  {
    id: 'achievements',
    title: { en: 'Earn Achievements', ar: 'احصل على الإنجازات' },
    description: { en: 'Complete tasks and earn rewards', ar: 'أكمل المهام واحصل على المكافآت' },
    icon: <EmojiEvents />,
    color: '#f59e0b',
    animation: 'bounceIn'
  }
];

// Confetti animation component
const ConfettiEffect = ({ active, colors = ['#dc2626', '#10b981', '#f59e0b', '#6366f1'] }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particleCount = 50;
    particles.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.vy += 0.1; // gravity
        
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
        
        // Remove particles that are off screen
        if (particle.y > canvas.height + 10) {
          particles.current.splice(index, 1);
        }
      });
      
      if (particles.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

// Achievement notification
const AchievementNotification = ({ achievement, isRTL, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setVisible(true);
    
    // Play achievement sound
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEYEBBMBIAMAFQDGAMAABBMBIAMAFQAGANYABBMBIAMAYgAGAN4ABBMBIAMAIwAGAPQAAAAAlAALABkBKAAyATABbAE4AAAAAlAALABkATAAQAFEAAAAABQACAAAAAAAAAEAAAERJZjGDOAAYAMAOwAUABgAAAAgBRJHr5LfgFHDNOAAABTMBIAMAIwAEABGAYwAMAAYACAAGABAAQAAAAFSMjAzAE4AUAGQAEAOAQAAcgDUAcQA');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors in environments where audio is not allowed
      });
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [soundEnabled, onClose]);

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'epic': return 'linear-gradient(135deg, #8b5cf6 0%, #be185d 100%)';
      case 'rare': return 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)';
      case 'uncommon': return 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #374151 100%)';
    }
  };

  return (
    <>
      <ConfettiEffect active={visible} colors={[achievement.color]} />
      <Slide direction="down" in={visible} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 10000,
            width: 350,
            maxWidth: 'calc(100vw - 40px)'
          }}
        >
          <Card
            sx={{
              background: getRarityGradient(achievement.rarity),
              backdropFilter: 'blur(20px)',
              border: `2px solid ${achievement.color}`,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              animation: 'achievementPulse 2s infinite',
              '@keyframes achievementPulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  boxShadow: `0 4px 20px ${achievement.color}40`
                },
                '50%': {
                  transform: 'scale(1.02)',
                  boxShadow: `0 8px 30px ${achievement.color}60`
                }
              }
            }}
          >
            <CardContent sx={{ p: 2, position: 'relative' }}>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}
              >
                <Close fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => setSoundEnabled(!soundEnabled)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 40,
                  color: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}
              >
                {soundEnabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" />}
              </IconButton>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    background: achievement.color,
                    fontSize: '1.5rem'
                  }}
                >
                  {achievement.icon}
                </Avatar>

                <Box flex={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: '1rem'
                    }}
                  >
                    🎉 {achievement.title[isRTL ? 'ar' : 'en']}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.85rem'
                    }}
                  >
                    {achievement.description[isRTL ? 'ar' : 'en']}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Chip
                  label={achievement.rarity.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Star sx={{ color: '#fbbf24', fontSize: 16 }} />
                  <Typography
                    variant="caption"
                    sx={{ color: 'white', fontWeight: 600 }}
                  >
                    +{achievement.points} {isRTL ? 'نقطة' : 'points'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Slide>
    </>
  );
};

// Main WelcomeExperience component
const WelcomeExperience = ({ isRTL = false, userProgress = {}, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [userStats, setUserStats] = useState({
    level: 1,
    totalPoints: 0,
    completedServices: 0,
    visitedDepartments: [],
    achievements: [],
    dailyStreak: 1,
    ...userProgress
  });

  // Auto-show onboarding for first-time users
  useEffect(() => {
    if (!userStats.achievements.includes('first_login')) {
      setIsOnboardingOpen(true);
      // Award first login achievement
      const firstLoginAchievement = ACHIEVEMENTS.FIRST_LOGIN;
      setShowAchievement(firstLoginAchievement);
      setUserStats(prev => ({
        ...prev,
        achievements: [...prev.achievements, firstLoginAchievement.id],
        totalPoints: prev.totalPoints + firstLoginAchievement.points
      }));
    }
  }, []);

  const handleStepNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleOnboardingComplete();
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    if (onComplete) onComplete();
  };

  const handleSkipOnboarding = () => {
    setIsOnboardingOpen(false);
    if (onSkip) onSkip();
  };

  const triggerAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (achievement && !userStats.achievements.includes(achievementId)) {
      setShowAchievement(achievement);
      setUserStats(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementId],
        totalPoints: prev.totalPoints + achievement.points
      }));
    }
  };

  // Level calculation
  const getLevel = (points) => Math.floor(points / 100) + 1;
  const getProgressToNextLevel = (points) => (points % 100) / 100 * 100;

  // User stats summary component
  const UserStatsSummary = () => (
    <Card
      className="welcome-stats-card"
      sx={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: 2,
        mb: 3
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
            {isRTL ? 'ملفك الشخصي' : 'Your Profile'}
          </Typography>
          <Chip
            label={`${isRTL ? 'المستوى' : 'Level'} ${getLevel(userStats.totalPoints)}`}
            sx={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>

        <Box display="flex" gap={3} mb={2}>
          <Box flex={1}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'إجمالي النقاط' : 'Total Points'}
            </Typography>
            <Typography variant="h4" sx={{ color: '#0ea5e9', fontWeight: 700 }}>
              {userStats.totalPoints}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'الإنجازات' : 'Achievements'}
            </Typography>
            <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
              {userStats.achievements.length}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'الخدمات المكتملة' : 'Services Used'}
            </Typography>
            <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
              {userStats.completedServices}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {isRTL ? 'التقدم إلى المستوى التالي' : 'Progress to Next Level'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
              {getProgressToNextLevel(userStats.totalPoints).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressToNextLevel(userStats.totalPoints)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#0ea5e9',
                borderRadius: 4
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* User Stats Display */}
      <UserStatsSummary />

      {/* Achievement Notification */}
      {showAchievement && (
        <AchievementNotification
          achievement={showAchievement}
          isRTL={isRTL}
          onClose={() => setShowAchievement(null)}
        />
      )}

      {/* Onboarding Dialog */}
      <Dialog
        open={isOnboardingOpen}
        maxWidth="md"
        fullWidth
        onClose={handleSkipOnboarding}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 2,
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              {isRTL ? 'مرحباً بالبوابة الحكومية' : 'Welcome to Sudan Portal'}
            </Typography>
            <IconButton onClick={handleSkipOnboarding} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={currentStep} orientation="vertical">
            {ONBOARDING_STEPS.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { color: 'rgba(255, 255, 255, 0.9)' },
                    '& .MuiStepIcon-root': { color: step.color }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: step.color,
                        fontSize: '1.2rem'
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {step.title[isRTL ? 'ar' : 'en']}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2, ml: 7 }}>
                    {step.description[isRTL ? 'ar' : 'en']}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleSkipOnboarding}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isRTL ? 'تخطي' : 'Skip Tour'}
          </Button>
          
          {currentStep > 0 && (
            <Button
              onClick={handleStepBack}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
          )}
          
          <Button
            onClick={handleStepNext}
            variant="contained"
            startIcon={currentStep === ONBOARDING_STEPS.length - 1 ? <Celebration /> : <PlayArrow />}
            sx={{
              backgroundColor: '#0ea5e9',
              '&:hover': { backgroundColor: '#0284c7' }
            }}
          >
            {currentStep === ONBOARDING_STEPS.length - 1 
              ? (isRTL ? 'ابدأ الآن' : 'Get Started')
              : (isRTL ? 'التالي' : 'Next')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Actions for Testing Achievements */}
      {process.env.NODE_ENV === 'development' && (
        <Card sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
            Development Tools:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {Object.keys(ACHIEVEMENTS).map(key => (
              <Button
                key={key}
                size="small"
                onClick={() => triggerAchievement(key)}
                disabled={userStats.achievements.includes(key)}
                sx={{
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(14, 165, 233, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(14, 165, 233, 0.3)'
                }}
              >
                {ACHIEVEMENTS[key].title.en}
              </Button>
            ))}
          </Box>
        </Card>
      )}
    </>
  );
};

export default WelcomeExperience;