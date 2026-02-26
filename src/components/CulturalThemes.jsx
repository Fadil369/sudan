import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Chip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import {
  Palette,
  Celebration,
  Star,
  Mosque,
  LocalFlorist,
  WbSunny,
  NightsStay,
  AutoAwesome,
  ColorLens,
  Brightness6,
  VolumeUp,
  VolumeOff,
  Settings,
  Refresh,
  Save,
  Close,
  Flag,
  Diamond,
  Favorite,
  Cake
} from '@mui/icons-material';

// Sudanese Cultural Themes and Celebrations
const CULTURAL_THEMES = {
  national: {
    id: 'national',
    name: { en: 'National Pride', ar: 'الفخر الوطني' },
    description: { en: 'Celebrating Sudanese heritage and unity', ar: 'احتفالاً بالتراث السوداني والوحدة' },
    colors: {
      primary: '#dc2626',    // Sudan flag red
      secondary: '#000000',  // Sudan flag black  
      accent: '#ffffff',     // Sudan flag white
      success: '#1e40af',    // Sudan flag blue
      background: 'linear-gradient(135deg, #dc2626 0%, #000000 30%, #ffffff 60%, #1e40af 100%)'
    },
    patterns: {
      geometric: 'M0,0 L20,0 L20,10 L10,10 L10,20 L0,20 Z',
      arabesque: 'M10,0 Q20,5 10,10 Q0,5 10,0 Z',
      tribal: 'M5,0 L15,0 L20,5 L15,10 L5,10 L0,5 Z'
    },
    sounds: {
      success: 'success_national.mp3',
      notification: 'notification_national.mp3'
    },
    icon: <Flag />
  },
  ramadan: {
    id: 'ramadan',
    name: { en: 'Ramadan Kareem', ar: 'رمضان كريم' },
    description: { en: 'Holy month of fasting and reflection', ar: 'الشهر المقدس للصيام والتأمل' },
    colors: {
      primary: '#059669',    // Green
      secondary: '#fbbf24',  // Gold
      accent: '#8b5cf6',     // Purple
      success: '#10b981',
      background: 'linear-gradient(135deg, #059669 0%, #fbbf24 50%, #8b5cf6 100%)'
    },
    patterns: {
      crescent: 'M10,2 A8,8 0 1,0 10,18 A6,6 0 1,1 10,2 Z',
      star: 'M10,0 L12,7 L20,7 L14,12 L16,20 L10,15 L4,20 L6,12 L0,7 L8,7 Z',
      mosque: 'M5,15 L5,5 Q5,0 10,0 Q15,0 15,5 L15,15 L12,15 L12,12 L8,12 L8,15 Z'
    },
    sounds: {
      success: 'success_ramadan.mp3',
      notification: 'notification_ramadan.mp3'
    },
    icon: <Mosque />,
    seasonal: true,
    duration: { start: '03-01', end: '04-30' } // Approximate dates
  },
  eid: {
    id: 'eid',
    name: { en: 'Eid Celebration', ar: 'عيد مبارك' },
    description: { en: 'Festival of joy and celebration', ar: 'مهرجان الفرح والاحتفال' },
    colors: {
      primary: '#ec4899',    // Pink
      secondary: '#f59e0b',  // Amber
      accent: '#10b981',     // Green
      success: '#8b5cf6',
      background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 25%, #10b981 75%, #8b5cf6 100%)'
    },
    patterns: {
      celebration: 'M10,5 L15,0 L20,5 L15,10 L20,15 L15,20 L10,15 L5,20 L0,15 L5,10 L0,5 L5,0 Z',
      flower: 'M10,0 Q15,5 10,10 Q5,5 10,0 M10,10 Q15,15 10,20 Q5,15 10,10 M0,10 Q5,5 10,10 Q5,15 0,10 M20,10 Q15,5 10,10 Q15,15 20,10',
      lantern: 'M7,0 L13,0 L15,2 L15,15 Q15,18 12,18 L8,18 Q5,18 5,15 L5,2 Z M8,4 L12,4 M8,7 L12,7 M8,10 L12,10'
    },
    sounds: {
      success: 'success_eid.mp3',
      notification: 'notification_eid.mp3'
    },
    icon: <Celebration />,
    effects: {
      confetti: true,
      sparkles: true,
      fireworks: true
    }
  },
  independence: {
    id: 'independence',
    name: { en: 'Independence Day', ar: 'عيد الاستقلال' },
    description: { en: 'Celebrating Sudan\'s independence', ar: 'احتفالاً باستقلال السودان' },
    colors: {
      primary: '#dc2626',
      secondary: '#fbbf24',
      accent: '#10b981',
      success: '#1e40af',
      background: 'radial-gradient(circle, #dc2626 0%, #fbbf24 25%, #10b981 50%, #1e40af 75%)'
    },
    patterns: {
      eagle: 'M10,0 L8,2 L6,1 L4,3 L2,2 L0,5 L3,8 L5,7 L7,9 L10,6 L13,9 L15,7 L17,8 L20,5 L18,2 L16,3 L14,1 L12,2 Z',
      torch: 'M9,0 L11,0 L11,15 L9,15 Z M7,15 L13,15 Q13,18 10,18 Q7,18 7,15 M8,0 Q10,2 12,0',
      victory: 'M0,10 L10,0 L20,10 L15,10 L10,5 L5,10 Z M10,5 L10,20'
    },
    sounds: {
      success: 'success_independence.mp3',
      notification: 'notification_independence.mp3'
    },
    icon: <Star />,
    effects: {
      fireworks: true,
      patrioticColors: true
    },
    seasonal: true,
    duration: { start: '01-01', end: '01-03' }
  },
  harvest: {
    id: 'harvest',
    name: { en: 'Harvest Season', ar: 'موسم الحصاد' },
    description: { en: 'Celebrating agricultural abundance', ar: 'احتفالاً بالوفرة الزراعية' },
    colors: {
      primary: '#eab308',    // Yellow
      secondary: '#15803d',  // Green
      accent: '#ea580c',     // Orange
      success: '#84cc16',
      background: 'linear-gradient(135deg, #eab308 0%, #15803d 50%, #ea580c 100%)'
    },
    patterns: {
      wheat: 'M10,0 L10,15 M5,3 L15,3 M6,6 L14,6 M7,9 L13,9 M8,12 L12,12',
      sun: 'M10,2 A8,8 0 1,1 10,18 A8,8 0 1,1 10,2 M10,0 L10,4 M18,10 L14,10 M2,10 L6,10 M15,5 L13,7 M5,5 L7,7 M15,15 L13,13 M5,15 L7,13',
      leaf: 'M0,10 Q5,0 10,10 Q15,20 10,10 Q5,20 0,10'
    },
    sounds: {
      success: 'success_harvest.mp3',
      notification: 'notification_harvest.mp3'
    },
    icon: <LocalFlorist />,
    seasonal: true,
    duration: { start: '10-01', end: '12-31' }
  }
};

// Special celebration animations and effects
const CELEBRATION_EFFECTS = {
  confetti: {
    particles: 50,
    colors: ['#dc2626', '#fbbf24', '#10b981', '#1e40af', '#8b5cf6'],
    duration: 3000
  },
  sparkles: {
    particles: 30,
    colors: ['#fbbf24', '#ffffff', '#f59e0b'],
    duration: 2000
  },
  fireworks: {
    particles: 100,
    colors: ['#dc2626', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899'],
    duration: 4000,
    explosions: 5
  }
};

// Celebration notification component
const CelebrationNotification = ({ theme, isActive, onClose }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!isActive || !theme?.effects) return;
    
    const effects = theme.effects;
    const newParticles = [];
    
    if (effects.confetti) {
      for (let i = 0; i < CELEBRATION_EFFECTS.confetti.particles; i++) {
        newParticles.push(createParticle('confetti', CELEBRATION_EFFECTS.confetti.colors));
      }
    }
    
    if (effects.sparkles) {
      for (let i = 0; i < CELEBRATION_EFFECTS.sparkles.particles; i++) {
        newParticles.push(createParticle('sparkle', CELEBRATION_EFFECTS.sparkles.colors));
      }
    }
    
    setParticles(newParticles);
    
    const timeout = setTimeout(() => {
      setParticles([]);
      onClose();
    }, Math.max(...Object.values(CELEBRATION_EFFECTS).map(e => e.duration)));
    
    return () => clearTimeout(timeout);
  }, [isActive, theme, onClose]);
  
  const createParticle = (type, colors) => ({
    id: Math.random(),
    type,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    rotation: Math.random() * 360,
    life: 1
  });
  
  if (!isActive || particles.length === 0) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.type === 'sparkle' ? '50%' : 0,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.life,
            animation: `fall-${particle.type} ${CELEBRATION_EFFECTS[particle.type]?.duration || 2000}ms linear infinite`,
            '@keyframes fall-confetti': {
              '0%': { transform: 'translateY(-100vh) rotate(0deg)' },
              '100%': { transform: 'translateY(100vh) rotate(360deg)' }
            },
            '@keyframes fall-sparkle': {
              '0%': { transform: 'scale(0) rotate(0deg)', opacity: 0 },
              '50%': { transform: 'scale(1) rotate(180deg)', opacity: 1 },
              '100%': { transform: 'scale(0) rotate(360deg)', opacity: 0 }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Cultural theme customization component
const CulturalThemes = ({ 
  isRTL = false, 
  currentTheme = 'national',
  onThemeChange,
  userPreferences = {},
  onPreferencesChange 
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(userPreferences.soundEnabled ?? true);
  const [effectsEnabled, setEffectsEnabled] = useState(userPreferences.effectsEnabled ?? true);
  const [autoTheme, setAutoTheme] = useState(userPreferences.autoTheme ?? true);
  const [brightness, setBrightness] = useState(userPreferences.brightness ?? 100);
  
  // Check for seasonal themes
  const getCurrentSeasonalTheme = useCallback(() => {
    const now = new Date();
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    for (const theme of Object.values(CULTURAL_THEMES)) {
      if (theme.seasonal && theme.duration) {
        const { start, end } = theme.duration;
        if (currentDate >= start && currentDate <= end) {
          return theme.id;
        }
      }
    }
    
    return null;
  }, []);
  
  // Auto-apply seasonal themes
  useEffect(() => {
    if (autoTheme) {
      const seasonalTheme = getCurrentSeasonalTheme();
      if (seasonalTheme && seasonalTheme !== selectedTheme) {
        setSelectedTheme(seasonalTheme);
        if (onThemeChange) onThemeChange(seasonalTheme);
        
        // Show celebration for seasonal theme activation
        if (effectsEnabled) {
          setCelebrationActive(true);
        }
      }
    }
  }, [autoTheme, selectedTheme, onThemeChange, effectsEnabled, getCurrentSeasonalTheme]);
  
  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    if (onThemeChange) onThemeChange(themeId);
    
    // Trigger celebration effects
    const theme = CULTURAL_THEMES[themeId];
    if (theme.effects && effectsEnabled) {
      setCelebrationActive(true);
    }
    
    // Play theme sound
    if (soundEnabled && theme.sounds?.success) {
      playThemeSound(theme.sounds.success);
    }
  };
  
  const playThemeSound = (soundFile) => {
    // In a real implementation, you would load and play actual sound files
    console.log(`Playing sound: ${soundFile}`);
  };
  
  const handleSavePreferences = () => {
    const preferences = {
      soundEnabled,
      effectsEnabled,
      autoTheme,
      brightness,
      selectedTheme
    };
    
    if (onPreferencesChange) onPreferencesChange(preferences);
    setCustomizationOpen(false);
  };
  
  const applyThemeStyles = (theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-brightness', `${brightness}%`);
    }
  };
  
  // Apply current theme styles
  useEffect(() => {
    const theme = CULTURAL_THEMES[selectedTheme];
    if (theme) {
      applyThemeStyles(theme);
    }
  }, [selectedTheme, brightness]);
  
  const currentThemeData = CULTURAL_THEMES[selectedTheme];
  
  return (
    <Box>
      {/* Celebration Effects */}
      <CelebrationNotification
        theme={currentThemeData}
        isActive={celebrationActive}
        onClose={() => setCelebrationActive(false)}
      />
      
      {/* Main Theme Selection */}
      <Card
        sx={{
          background: currentThemeData?.colors?.background || 'var(--sudan-gradient-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  backgroundColor: currentThemeData?.colors?.primary || '#6366f1',
                  width: 50,
                  height: 50
                }}
              >
                {currentThemeData?.icon || <Palette />}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  {isRTL ? 'السمات الثقافية' : 'Cultural Themes'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {currentThemeData?.name[isRTL ? 'ar' : 'en']}
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              onClick={() => setCustomizationOpen(true)}
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              <Settings />
            </IconButton>
          </Box>
          
          {/* Current Theme Display */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              mb: 3
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                {isRTL ? 'السمة الحالية' : 'Current Theme'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                {currentThemeData?.description[isRTL ? 'ar' : 'en']}
              </Typography>
              
              {/* Theme Preview Colors */}
              <Box display="flex" gap={1} mb={2}>
                {Object.entries(currentThemeData?.colors || {}).map(([key, color]) => {
                  if (key === 'background') return null;
                  return (
                    <Tooltip key={key} title={key}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1,
                          backgroundColor: color,
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
              
              {/* Special Features */}
              {currentThemeData?.seasonal && (
                <Chip
                  icon={<AutoAwesome />}
                  label={isRTL ? 'سمة موسمية' : 'Seasonal Theme'}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    mr: 1
                  }}
                />
              )}
              
              {currentThemeData?.effects && (
                <Chip
                  icon={<Star />}
                  label={isRTL ? 'تأثيرات خاصة' : 'Special Effects'}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Theme Selection Grid */}
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            {isRTL ? 'اختر سمة' : 'Select Theme'}
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(CULTURAL_THEMES).map(([themeId, theme]) => (
              <Grid item xs={12} sm={6} md={4} key={themeId}>
                <Card
                  sx={{
                    background: selectedTheme === themeId 
                      ? `linear-gradient(135deg, ${theme.colors.primary}40 0%, ${theme.colors.secondary}20 100%)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedTheme === themeId 
                      ? `2px solid ${theme.colors.primary}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${theme.colors.primary}40`
                    }
                  }}
                  onClick={() => handleThemeChange(themeId)}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        backgroundColor: theme.colors.primary,
                        width: 40,
                        height: 40,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      {theme.icon}
                    </Avatar>
                    
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {theme.name[isRTL ? 'ar' : 'en']}
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" gap={0.5} mb={1}>
                      {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                      ))}
                    </Box>
                    
                    {theme.seasonal && (
                      <Chip
                        label={isRTL ? 'موسمي' : 'Seasonal'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Quick Actions */}
          <Box display="flex" gap={2} mt={3} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<Celebration />}
              onClick={() => setCelebrationActive(true)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: currentThemeData?.colors?.primary,
                  backgroundColor: `${currentThemeData?.colors?.primary}20`
                }
              }}
            >
              {isRTL ? 'اختبار التأثيرات' : 'Test Effects'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => handleThemeChange('national')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)'
                }
              }}
            >
              {isRTL ? 'إعادة تعيين' : 'Reset to Default'}
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Customization Dialog */}
      <Dialog
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {isRTL ? 'تخصيص السمة' : 'Theme Customization'}
            </Typography>
            <IconButton onClick={() => setCustomizationOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Sound Settings */}
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
              }
              label={isRTL ? 'تمكين الأصوات' : 'Enable Sound Effects'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Visual Effects */}
            <FormControlLabel
              control={
                <Switch
                  checked={effectsEnabled}
                  onChange={(e) => setEffectsEnabled(e.target.checked)}
                />
              }
              label={isRTL ? 'تمكين التأثيرات البصرية' : 'Enable Visual Effects'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Auto Theme */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoTheme}
                  onChange={(e) => setAutoTheme(e.target.checked)}
                />
              }
              label={isRTL ? 'السمات الموسمية التلقائية' : 'Auto Seasonal Themes'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Brightness */}
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
                {isRTL ? 'السطوع' : 'Brightness'}: {brightness}%
              </Typography>
              <Slider
                value={brightness}
                onChange={(e, value) => setBrightness(value)}
                min={50}
                max={150}
                step={10}
                sx={{
                  color: currentThemeData?.colors?.primary || '#6366f1',
                  '& .MuiSlider-thumb': {
                    backgroundColor: currentThemeData?.colors?.primary || '#6366f1'
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setCustomizationOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
            startIcon={<Save />}
            sx={{
              backgroundColor: currentThemeData?.colors?.primary || '#6366f1',
              '&:hover': {
                backgroundColor: currentThemeData?.colors?.secondary || '#5b5bd6'
              }
            }}
          >
            {isRTL ? 'حفظ' : 'Save Preferences'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CulturalThemes;
export { CULTURAL_THEMES, CELEBRATION_EFFECTS };