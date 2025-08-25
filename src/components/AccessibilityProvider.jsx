import {
  Accessibility,
  VolumeUp,
  VolumeOff,
  FormatSize,
  Contrast,
  RemoveRedEye,
  TouchApp,
  Keyboard,
  MouseIcon,
  HearingDisabled,
  ClosedCaption,
  SettingsVoice,
  Translate,
  Language,
  ZoomIn,
  ZoomOut,
  Brightness6,
  BrightnessHigh,
  BrightnessLow,
  Psychology
} from '@mui/icons-material';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// WCAG 2.1 AA Compliance Standards
const WCAG_STANDARDS = {
  minContrastRatio: 4.5, // AA standard
  minTouchTarget: 44, // 44px minimum touch target
  maxTextLength: 80, // characters per line
  animationDuration: {
    short: 200,
    medium: 500,
    long: 1000,
    reduced: 10 // for prefers-reduced-motion
  },
  fontSize: {
    min: 12,
    default: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32
  }
};

const AccessibilityProvider = ({ children, isRTL = false }) => {
  // Accessibility State
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    // Visual Accessibility
    highContrast: false,
    fontSize: 'default', // small, default, large, xlarge
    colorBlindnessFilter: 'none', // none, protanopia, deuteranopia, tritanopia
    reducedMotion: false,
    
    // Auditory Accessibility  
    soundEnabled: true,
    screenReaderMode: false,
    captionsEnabled: false,
    audioDescriptions: false,
    
    // Motor Accessibility
    stickyKeys: false,
    clickDelay: 0, // milliseconds
    touchGestures: true,
    keyboardNavigation: true,
    
    // Cognitive Accessibility
    simplifiedInterface: false,
    extendedTimeout: false,
    autoComplete: true,
    focusIndicators: true,
    
    // Language Accessibility
    language: isRTL ? 'ar' : 'en',
    textToSpeech: false,
    translationEnabled: false,
    rightToLeft: isRTL
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('visual');
  const [announcements, setAnnouncements] = useState([]);

  // Initialize accessibility from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('sudan-accessibility-settings');
    if (savedSettings) {
      try {
        setAccessibilitySettings(prev => ({
          ...prev,
          ...JSON.parse(savedSettings)
        }));
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      }
    }

    // Detect system preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAccessibilitySettings(prev => ({ ...prev, reducedMotion: true }));
    }

    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      setAccessibilitySettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('sudan-accessibility-settings', JSON.stringify(accessibilitySettings));
    applyAccessibilitySettings();
  }, [accessibilitySettings]);

  // Apply accessibility settings to DOM
  const applyAccessibilitySettings = useCallback(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      small: '14px',
      default: '16px',
      large: '20px',
      xlarge: '24px'
    };
    root.style.setProperty('--accessibility-font-size', fontSizeMap[accessibilitySettings.fontSize]);
    
    // High contrast
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
    
    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // RTL support
    if (accessibilitySettings.rightToLeft) {
      root.setAttribute('dir', 'rtl');
      root.classList.add('rtl-mode');
    } else {
      root.setAttribute('dir', 'ltr');
      root.classList.remove('rtl-mode');
    }
    
    // Color blindness filters
    if (accessibilitySettings.colorBlindnessFilter !== 'none') {
      root.classList.add(`colorblind-${accessibilitySettings.colorBlindnessFilter}`);
    } else {
      root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    }
    
    // Focus indicators
    if (accessibilitySettings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }, [accessibilitySettings]);

  // Announce to screen readers
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority, // polite, assertive
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev.slice(-4), announcement]); // Keep last 5
    
    // Create ARIA live region announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Clean up after announcement
    setTimeout(() => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    }, 1000);
  }, []);

  // Text-to-Speech functionality
  const speak = useCallback((text, options = {}) => {
    if (!accessibilitySettings.textToSpeech || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accessibilitySettings.language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    window.speechSynthesis.speak(utterance);
  }, [accessibilitySettings.textToSpeech, accessibilitySettings.language]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((event) => {
    if (!accessibilitySettings.keyboardNavigation) return;
    
    // Enhanced keyboard shortcuts for government portal
    if (event.altKey) {
      switch (event.key) {
        case 'h':
          // Navigate to home
          event.preventDefault();
          announce(isRTL ? 'الانتقال إلى الصفحة الرئيسية' : 'Navigating to home');
          break;
        case 's':
          // Open search
          event.preventDefault();
          announce(isRTL ? 'فتح البحث' : 'Opening search');
          break;
        case 'a':
          // Open accessibility panel
          event.preventDefault();
          setDialogOpen(true);
          announce(isRTL ? 'فتح إعدادات إمكانية الوصول' : 'Opening accessibility settings');
          break;
        case 'm':
          // Navigate to main content
          event.preventDefault();
          const main = document.querySelector('main, [role="main"]');
          if (main) {
            main.focus();
            announce(isRTL ? 'الانتقال إلى المحتوى الرئيسي' : 'Jumping to main content');
          }
          break;
      }
    }
    
    // Tab key enhancement
    if (event.key === 'Tab') {
      // Ensure focus is visible
      setTimeout(() => {
        const focused = document.activeElement;
        if (focused) {
          focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 10);
    }
  }, [accessibilitySettings.keyboardNavigation, announce, isRTL]);

  // Attach keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, [handleKeyboardNavigation]);

  const updateSetting = (key, value) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Announce change
    announce(
      isRTL 
        ? `تم تغيير إعداد ${key} إلى ${value}`
        : `${key} setting changed to ${value}`,
      'assertive'
    );
  };

  const renderVisualPanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
        {isRTL ? 'إعدادات الإبصار' : 'Visual Settings'}
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText
            primary={isRTL ? 'التباين العالي' : 'High Contrast Mode'}
            secondary={isRTL ? 'تحسين التباين للرؤية بوضوح أكبر' : 'Improve contrast for better visibility'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.highContrast}
            onChange={(e) => updateSetting('highContrast', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'حجم النص' : 'Text Size'}
            secondary={isRTL ? 'تغيير حجم النص للراحة' : 'Adjust text size for comfort'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={accessibilitySettings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <MenuItem value="small">{isRTL ? 'صغير' : 'Small'}</MenuItem>
              <MenuItem value="default">{isRTL ? 'افتراضي' : 'Default'}</MenuItem>
              <MenuItem value="large">{isRTL ? 'كبير' : 'Large'}</MenuItem>
              <MenuItem value="xlarge">{isRTL ? 'كبير جداً' : 'Extra Large'}</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'فلتر عمى الألوان' : 'Color Blindness Filter'}
            secondary={isRTL ? 'تطبيق فلاتر لدعم عمى الألوان' : 'Apply filters to support color blindness'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={accessibilitySettings.colorBlindnessFilter}
              onChange={(e) => updateSetting('colorBlindnessFilter', e.target.value)}
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              <MenuItem value="none">{isRTL ? 'بدون' : 'None'}</MenuItem>
              <MenuItem value="protanopia">{isRTL ? 'بروتانوبيا' : 'Protanopia'}</MenuItem>
              <MenuItem value="deuteranopia">{isRTL ? 'ديوترانوبيا' : 'Deuteranopia'}</MenuItem>
              <MenuItem value="tritanopia">{isRTL ? 'تريتانوبيا' : 'Tritanopia'}</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'تقليل الحركة' : 'Reduced Motion'}
            secondary={isRTL ? 'تقليل الرسوم المتحركة والانتقالات' : 'Reduce animations and transitions'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.reducedMotion}
            onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderAudioPanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
        {isRTL ? 'إعدادات الصوت' : 'Audio Settings'}
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText
            primary={isRTL ? 'تمكين الصوت' : 'Sound Enabled'}
            secondary={isRTL ? 'تشغيل الأصوات والتنبيهات' : 'Enable sounds and audio alerts'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'قارئ الشاشة' : 'Screen Reader Mode'}
            secondary={isRTL ? 'تحسين التوافق مع قارئات الشاشة' : 'Optimize for screen reader compatibility'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.screenReaderMode}
            onChange={(e) => updateSetting('screenReaderMode', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'النص إلى كلام' : 'Text-to-Speech'}
            secondary={isRTL ? 'قراءة النصوص بصوت عالٍ' : 'Read text content aloud'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.textToSpeech}
            onChange={(e) => updateSetting('textToSpeech', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'التسميات التوضيحية' : 'Captions Enabled'}
            secondary={isRTL ? 'عرض التسميات التوضيحية للفيديو' : 'Show captions for video content'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.captionsEnabled}
            onChange={(e) => updateSetting('captionsEnabled', e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderMotorPanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
        {isRTL ? 'إعدادات الحركة' : 'Motor Settings'}
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText
            primary={isRTL ? 'المفاتيح اللزجة' : 'Sticky Keys'}
            secondary={isRTL ? 'السماح بالضغط المتتالي للمفاتيح' : 'Allow sequential key pressing'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.stickyKeys}
            onChange={(e) => updateSetting('stickyKeys', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'تأخير النقر' : 'Click Delay'}
            secondary={isRTL ? 'زمن إضافي قبل تنفيذ النقر' : 'Extra time before click execution'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Box sx={{ width: 120 }}>
            <Slider
              value={accessibilitySettings.clickDelay}
              onChange={(e, value) => updateSetting('clickDelay', value)}
              min={0}
              max={2000}
              step={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}ms`}
              sx={{ color: '#0ea5e9' }}
            />
          </Box>
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'إشارات اللمس' : 'Touch Gestures'}
            secondary={isRTL ? 'تمكين إشارات اللمس للأجهزة المحمولة' : 'Enable touch gestures for mobile devices'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.touchGestures}
            onChange={(e) => updateSetting('touchGestures', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'التنقل بلوحة المفاتيح' : 'Keyboard Navigation'}
            secondary={isRTL ? 'تمكين التنقل الكامل بلوحة المفاتيح' : 'Enable full keyboard navigation'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.keyboardNavigation}
            onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderCognitivePanel = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
        {isRTL ? 'إعدادات الإدراك' : 'Cognitive Settings'}
      </Typography>
      
      <List>
        <ListItem>
          <ListItemText
            primary={isRTL ? 'واجهة مبسطة' : 'Simplified Interface'}
            secondary={isRTL ? 'عرض واجهة أبسط مع أقل تشتيت' : 'Show simpler interface with less distraction'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.simplifiedInterface}
            onChange={(e) => updateSetting('simplifiedInterface', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'مهلة زمنية ممددة' : 'Extended Timeout'}
            secondary={isRTL ? 'وقت إضافي لإكمال المهام' : 'Extra time to complete tasks'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.extendedTimeout}
            onChange={(e) => updateSetting('extendedTimeout', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'الإكمال التلقائي' : 'Auto Complete'}
            secondary={isRTL ? 'مساعدة في ملء النماذج تلقائياً' : 'Help with automatic form completion'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.autoComplete}
            onChange={(e) => updateSetting('autoComplete', e.target.checked)}
            color="primary"
          />
        </ListItem>
        
        <ListItem>
          <ListItemText
            primary={isRTL ? 'مؤشرات التركيز' : 'Focus Indicators'}
            secondary={isRTL ? 'إبراز العناصر المركز عليها' : 'Highlight focused elements clearly'}
            sx={{
              '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' },
              '& .MuiTypography-body2': { color: 'rgba(255, 255, 255, 0.6)' }
            }}
          />
          <Switch
            checked={accessibilitySettings.focusIndicators}
            onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
            color="primary"
          />
        </ListItem>
      </List>
    </Box>
  );

  const contextValue = {
    accessibilitySettings,
    updateSetting,
    announce,
    speak,
    WCAG_STANDARDS,
    isRTL: accessibilitySettings.rightToLeft
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Floating Accessibility Button */}
      <Fab
        color="primary"
        aria-label={isRTL ? 'إعدادات إمكانية الوصول' : 'Accessibility Settings'}
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: isRTL ? 16 : 'auto',
          right: isRTL ? 'auto' : 16,
          zIndex: 1300,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)'
          }
        }}
      >
        <Accessibility />
      </Fab>
      
      {/* Accessibility Settings Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Accessibility sx={{ color: '#0ea5e9' }} />
            <Typography variant="h6">
              {isRTL ? 'إعدادات إمكانية الوصول' : 'Accessibility Settings'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Settings Navigation */}
            <Grid item xs={12} sm={4}>
              <List sx={{ py: 2, borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <ListItem
                  button
                  selected={activePanel === 'visual'}
                  onClick={() => setActivePanel('visual')}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <RemoveRedEye sx={{ color: '#0ea5e9' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'الإبصار' : 'Visual'}
                    sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  />
                </ListItem>
                
                <ListItem
                  button
                  selected={activePanel === 'audio'}
                  onClick={() => setActivePanel('audio')}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <VolumeUp sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'السمع' : 'Audio'}
                    sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  />
                </ListItem>
                
                <ListItem
                  button
                  selected={activePanel === 'motor'}
                  onClick={() => setActivePanel('motor')}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <TouchApp sx={{ color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'الحركة' : 'Motor'}
                    sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  />
                </ListItem>
                
                <ListItem
                  button
                  selected={activePanel === 'cognitive'}
                  onClick={() => setActivePanel('cognitive')}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(14, 165, 233, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Psychology sx={{ color: '#a855f7' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={isRTL ? 'الإدراك' : 'Cognitive'}
                    sx={{ '& .MuiTypography-root': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  />
                </ListItem>
              </List>
            </Grid>
            
            {/* Settings Panel */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ p: 3, height: '400px', overflowY: 'auto' }}>
                {activePanel === 'visual' && renderVisualPanel()}
                {activePanel === 'audio' && renderAudioPanel()}
                {activePanel === 'motor' && renderMotorPanel()}
                {activePanel === 'cognitive' && renderCognitivePanel()}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button
            onClick={() => {
              // Reset to defaults
              setAccessibilitySettings({
                highContrast: false,
                fontSize: 'default',
                colorBlindnessFilter: 'none',
                reducedMotion: false,
                soundEnabled: true,
                screenReaderMode: false,
                captionsEnabled: false,
                audioDescriptions: false,
                stickyKeys: false,
                clickDelay: 0,
                touchGestures: true,
                keyboardNavigation: true,
                simplifiedInterface: false,
                extendedTimeout: false,
                autoComplete: true,
                focusIndicators: true,
                language: isRTL ? 'ar' : 'en',
                textToSpeech: false,
                translationEnabled: false,
                rightToLeft: isRTL
              });
              announce(isRTL ? 'تم إعادة تعيين الإعدادات' : 'Settings reset to defaults');
            }}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isRTL ? 'إعادة التعيين' : 'Reset'}
          </Button>
          
          <Button
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              ml: 2
            }}
          >
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ARIA Live Region for Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;