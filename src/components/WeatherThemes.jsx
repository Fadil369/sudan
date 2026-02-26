import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Grain,
  Thunderstorm,
  AcUnit,
  Visibility,
  Air,
  WaterDrop,
  Thermostat,
  Speed,
  CompressIcon,
  Settings,
  Refresh,
  LocationOn,
  Schedule,
  TrendingUp,
  Close,
  PlayArrow,
  Pause
} from '@mui/icons-material';

// Weather-based theme configurations
const WEATHER_THEMES = {
  sunny: {
    id: 'sunny',
    name: { en: 'Sunny Day', ar: 'يوم مشمس' },
    description: { en: 'Bright and energetic interface', ar: 'واجهة مشرقة ونشطة' },
    colors: {
      primary: '#f59e0b',
      secondary: '#eab308',
      accent: '#fbbf24',
      background: 'radial-gradient(circle at 30% 20%, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
      overlay: 'rgba(251, 191, 36, 0.1)'
    },
    effects: {
      particles: 'sunbeams',
      animation: 'gentle_sway',
      brightness: 120,
      contrast: 110
    },
    icon: <WbSunny />,
    conditions: ['sunny', 'clear']
  },
  cloudy: {
    id: 'cloudy',
    name: { en: 'Cloudy Sky', ar: 'سماء غائمة' },
    description: { en: 'Soft and comfortable interface', ar: 'واجهة ناعمة ومريحة' },
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#d1d5db',
      background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
      overlay: 'rgba(107, 114, 128, 0.1)'
    },
    effects: {
      particles: 'floating_clouds',
      animation: 'drift',
      brightness: 90,
      contrast: 95
    },
    icon: <Cloud />,
    conditions: ['cloudy', 'overcast', 'partly_cloudy']
  },
  rainy: {
    id: 'rainy',
    name: { en: 'Rainy Weather', ar: 'طقس ممطر' },
    description: { en: 'Fresh and dynamic interface', ar: 'واجهة منعشة وديناميكية' },
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      overlay: 'rgba(14, 165, 233, 0.15)'
    },
    effects: {
      particles: 'raindrops',
      animation: 'vertical_flow',
      brightness: 80,
      contrast: 120
    },
    icon: <Grain />,
    conditions: ['rain', 'drizzle', 'showers']
  },
  stormy: {
    id: 'stormy',
    name: { en: 'Thunderstorm', ar: 'عاصفة رعدية' },
    description: { en: 'Dramatic and intense interface', ar: 'واجهة دراماتيكية ومكثفة' },
    colors: {
      primary: '#7c3aed',
      secondary: '#5b21b6',
      accent: '#8b5cf6',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
      overlay: 'rgba(124, 58, 237, 0.2)'
    },
    effects: {
      particles: 'lightning',
      animation: 'intense_pulse',
      brightness: 70,
      contrast: 140
    },
    icon: <Thunderstorm />,
    conditions: ['thunderstorm', 'storm', 'severe']
  },
  dusty: {
    id: 'dusty',
    name: { en: 'Dust Storm', ar: 'عاصفة ترابية' },
    description: { en: 'Warm desert atmosphere', ar: 'أجواء صحراوية دافئة' },
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f97316',
      background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
      overlay: 'rgba(234, 88, 12, 0.15)'
    },
    effects: {
      particles: 'dust_particles',
      animation: 'swirl',
      brightness: 85,
      contrast: 105
    },
    icon: <Air />,
    conditions: ['dust', 'sandstorm', 'haze']
  },
  cool: {
    id: 'cool',
    name: { en: 'Cool Breeze', ar: 'نسيم بارد' },
    description: { en: 'Refreshing and calm interface', ar: 'واجهة منعشة وهادئة' },
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#67e8f9',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      overlay: 'rgba(6, 182, 212, 0.1)'
    },
    effects: {
      particles: 'cool_breeze',
      animation: 'gentle_wave',
      brightness: 95,
      contrast: 100
    },
    icon: <AcUnit />,
    conditions: ['cool', 'windy', 'fresh']
  }
};

// Weather data structure (in real app, this would come from an API)
const MOCK_WEATHER_DATA = {
  temperature: 32,
  humidity: 45,
  windSpeed: 12,
  pressure: 1013,
  visibility: 10,
  uvIndex: 8,
  condition: 'sunny',
  location: { en: 'Khartoum, Sudan', ar: 'الخرطوم، السودان' },
  forecast: [
    { day: 'Today', condition: 'sunny', high: 35, low: 22 },
    { day: 'Tomorrow', condition: 'partly_cloudy', high: 33, low: 20 },
    { day: 'Friday', condition: 'cloudy', high: 29, low: 18 },
    { day: 'Saturday', condition: 'rain', high: 25, low: 16 }
  ]
};

// Weather particle effects
const WeatherParticles = ({ theme, isActive, intensity = 50 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [particles, setParticles] = useState([]);

  const createParticles = useCallback((type, count) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(type));
    }
    return newParticles;
  }, []);

  const createParticle = (type) => {
    const particle = {
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      life: 1
    };

    switch (type) {
      case 'sunbeams':
        particle.vx = Math.sin(Date.now() * 0.001 + particle.id) * 0.5;
        particle.vy = Math.cos(Date.now() * 0.001 + particle.id) * 0.5;
        particle.color = '#fbbf24';
        break;
      case 'raindrops':
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = particle.speed * 2;
        particle.color = '#38bdf8';
        particle.length = Math.random() * 10 + 5;
        break;
      case 'dust_particles':
        particle.vx = (Math.random() - 0.5) * 1.5;
        particle.vy = (Math.random() - 0.5) * 0.8;
        particle.color = '#ea580c';
        break;
      case 'floating_clouds':
        particle.vx = particle.speed * 0.3;
        particle.vy = (Math.random() - 0.5) * 0.2;
        particle.color = '#9ca3af';
        particle.size = Math.random() * 8 + 4;
        break;
      case 'lightning':
        particle.vx = 0;
        particle.vy = 0;
        particle.color = '#8b5cf6';
        particle.flash = Math.random() > 0.98;
        break;
      default:
        particle.vx = (Math.random() - 0.5) * 1;
        particle.vy = (Math.random() - 0.5) * 1;
        particle.color = theme?.colors?.accent || '#ffffff';
    }

    return particle;
  };

  useEffect(() => {
    if (!isActive || !theme?.effects?.particles) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Initialize particles
    const particleCount = Math.floor((intensity / 100) * 100);
    const initialParticles = createParticles(theme.effects.particles, particleCount);
    setParticles(initialParticles);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Update particle position
          particle.x += particle.vx || 0;
          particle.y += particle.vy || 0;
          particle.life -= 0.01;

          // Wrap around screen
          if (particle.x > 100) particle.x = 0;
          if (particle.x < 0) particle.x = 100;
          if (particle.y > 100) particle.y = 0;
          if (particle.y < 0) particle.y = 100;

          // Draw particle
          ctx.save();
          ctx.globalAlpha = particle.opacity * particle.life;
          ctx.fillStyle = particle.color;

          const screenX = (particle.x / 100) * canvas.width;
          const screenY = (particle.y / 100) * canvas.height;

          if (theme.effects.particles === 'raindrops') {
            // Draw raindrop as line
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + particle.vx, screenY + particle.length);
            ctx.stroke();
          } else if (theme.effects.particles === 'lightning') {
            // Draw lightning flash
            if (particle.flash) {
              ctx.fillStyle = particle.color;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              particle.flash = false;
            }
          } else {
            // Draw regular particle
            ctx.beginPath();
            ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          return particle.life > 0 ? particle : createParticle(theme.effects.particles);
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, theme, intensity, createParticles]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

// Weather widget component
const WeatherWidget = ({ weatherData, theme, isRTL = false }) => {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme?.colors?.overlay || 'rgba(0,0,0,0.1)'} 0%, transparent 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ backgroundColor: theme?.colors?.primary, width: 32, height: 32 }}>
              {theme?.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontSize: '0.9rem' }}>
                {weatherData.temperature}°C
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {weatherData.location[isRTL ? 'ar' : 'en']}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={theme?.name[isRTL ? 'ar' : 'en']}
            size="small"
            sx={{
              backgroundColor: theme?.colors?.primary,
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <WaterDrop sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {weatherData.humidity}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Air sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {weatherData.windSpeed} km/h
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Visibility sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {weatherData.visibility} km
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Speed sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {weatherData.pressure} hPa
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main WeatherThemes component
const WeatherThemes = ({ 
  isRTL = false, 
  onThemeChange,
  userPreferences = {},
  onPreferencesChange 
}) => {
  const [weatherEnabled, setWeatherEnabled] = useState(userPreferences.weatherEnabled ?? true);
  const [currentWeather, setCurrentWeather] = useState(MOCK_WEATHER_DATA);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [particleIntensity, setParticleIntensity] = useState(userPreferences.particleIntensity ?? 50);
  const [animationsEnabled, setAnimationsEnabled] = useState(userPreferences.animationsEnabled ?? true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(userPreferences.autoUpdate ?? true);
  const [updateInterval, setUpdateInterval] = useState(userPreferences.updateInterval ?? 30);

  // Get appropriate theme based on weather condition
  const getWeatherTheme = useCallback((condition) => {
    for (const theme of Object.values(WEATHER_THEMES)) {
      if (theme.conditions.includes(condition)) {
        return theme;
      }
    }
    return WEATHER_THEMES.sunny; // default
  }, []);

  // Update theme based on weather
  useEffect(() => {
    if (!weatherEnabled) return;

    const theme = getWeatherTheme(currentWeather.condition);
    setCurrentTheme(theme);
    
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [currentWeather.condition, weatherEnabled, getWeatherTheme, onThemeChange]);

  // Apply theme styles to CSS variables
  useEffect(() => {
    if (!currentTheme || typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--weather-primary', currentTheme.colors.primary);
    root.style.setProperty('--weather-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--weather-accent', currentTheme.colors.accent);
    root.style.setProperty('--weather-background', currentTheme.colors.background);
    root.style.setProperty('--weather-overlay', currentTheme.colors.overlay);
    
    if (currentTheme.effects) {
      root.style.setProperty('--weather-brightness', `${currentTheme.effects.brightness}%`);
      root.style.setProperty('--weather-contrast', `${currentTheme.effects.contrast}%`);
    }
  }, [currentTheme]);

  // Auto-update weather data
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      // In real implementation, fetch from weather API
      const conditions = ['sunny', 'cloudy', 'partly_cloudy', 'rain', 'dust'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setCurrentWeather(prev => ({
        ...prev,
        condition: randomCondition,
        temperature: prev.temperature + (Math.random() - 0.5) * 4,
        humidity: Math.max(20, Math.min(90, prev.humidity + (Math.random() - 0.5) * 10))
      }));
    }, updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval]);

  const handleSavePreferences = () => {
    const preferences = {
      weatherEnabled,
      particleIntensity,
      animationsEnabled,
      autoUpdate,
      updateInterval
    };
    
    if (onPreferencesChange) {
      onPreferencesChange(preferences);
    }
    
    setSettingsOpen(false);
  };

  const handleRefreshWeather = () => {
    // Simulate weather data refresh
    const conditions = Object.values(WEATHER_THEMES).map(t => t.conditions).flat();
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setCurrentWeather(prev => ({
      ...prev,
      condition: randomCondition,
      temperature: Math.floor(Math.random() * 20) + 20,
      humidity: Math.floor(Math.random() * 60) + 30
    }));
  };

  if (!weatherEnabled) {
    return (
      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            {isRTL ? 'السمات الطقسية معطلة' : 'Weather Themes Disabled'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setWeatherEnabled(true)}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white'
            }}
          >
            {isRTL ? 'تفعيل' : 'Enable Weather Themes'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Main Weather Theme Card */}
      <Card
        sx={{
          position: 'relative',
          background: currentTheme?.colors?.background || 'var(--sudan-gradient-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: 400
        }}
      >
        {/* Weather Particles */}
        <WeatherParticles
          theme={currentTheme}
          isActive={animationsEnabled}
          intensity={particleIntensity}
        />

        <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  backgroundColor: currentTheme?.colors?.primary,
                  width: 60,
                  height: 60,
                  fontSize: '2rem'
                }}
              >
                {currentTheme?.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  {isRTL ? 'السمات الطقسية' : 'Weather Themes'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {currentTheme?.description[isRTL ? 'ar' : 'en']}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <IconButton
                onClick={handleRefreshWeather}
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <Refresh />
              </IconButton>
              <IconButton
                onClick={() => setSettingsOpen(true)}
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <Settings />
              </IconButton>
            </Box>
          </Box>

          {/* Current Weather Widget */}
          <Box mb={3}>
            <WeatherWidget
              weatherData={currentWeather}
              theme={currentTheme}
              isRTL={isRTL}
            />
          </Box>

          {/* Theme Effects Preview */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              mb: 3
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                {isRTL ? 'تأثيرات السمة الحالية' : 'Current Theme Effects'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: currentTheme?.colors?.primary, fontWeight: 700 }}>
                      {currentTheme?.effects?.brightness || 100}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {isRTL ? 'السطوع' : 'Brightness'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: currentTheme?.colors?.accent, fontWeight: 700 }}>
                      {currentTheme?.effects?.contrast || 100}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {isRTL ? 'التباين' : 'Contrast'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ color: currentTheme?.colors?.secondary, fontWeight: 700 }}>
                      {particleIntensity}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {isRTL ? 'كثافة الجسيمات' : 'Particles'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box textAlign="center">
                    <Chip
                      label={animationsEnabled ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'معطل' : 'Disabled')}
                      sx={{
                        backgroundColor: animationsEnabled ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 1 }}>
                      {isRTL ? 'الرسوم المتحركة' : 'Animations'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Available Weather Themes */}
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            {isRTL ? 'السمات المتاحة' : 'Available Themes'}
          </Typography>
          
          <Grid container spacing={2}>
            {Object.values(WEATHER_THEMES).map((theme) => (
              <Grid item xs={12} sm={6} md={4} key={theme.id}>
                <Card
                  sx={{
                    background: currentTheme?.id === theme.id 
                      ? `linear-gradient(135deg, ${theme.colors.primary}40 0%, ${theme.colors.secondary}20 100%)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: currentTheme?.id === theme.id 
                      ? `2px solid ${theme.colors.primary}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.colors.primary}30`
                    }
                  }}
                  onClick={() => {
                    setCurrentWeather(prev => ({
                      ...prev,
                      condition: theme.conditions[0]
                    }));
                  }}
                >
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        backgroundColor: theme.colors.primary,
                        width: 32,
                        height: 32,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      {theme.icon}
                    </Avatar>
                    
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {theme.name[isRTL ? 'ar' : 'en']}
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
              {isRTL ? 'إعدادات السمات الطقسية' : 'Weather Theme Settings'}
            </Typography>
            <IconButton onClick={() => setSettingsOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} py={2}>
            {/* Weather Themes Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={weatherEnabled}
                  onChange={(e) => setWeatherEnabled(e.target.checked)}
                />
              }
              label={isRTL ? 'تمكين السمات الطقسية' : 'Enable Weather Themes'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Animations Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
              }
              label={isRTL ? 'تمكين الرسوم المتحركة' : 'Enable Animations'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Auto Update Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                />
              }
              label={isRTL ? 'التحديث التلقائي للطقس' : 'Auto Update Weather'}
              sx={{ '& .MuiFormControlLabel-label': { color: 'white' } }}
            />
            
            {/* Particle Intensity */}
            <Box>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                {isRTL ? 'كثافة الجسيمات' : 'Particle Intensity'}: {particleIntensity}%
              </Typography>
              <Slider
                value={particleIntensity}
                onChange={(e, value) => setParticleIntensity(value)}
                min={0}
                max={100}
                step={10}
                sx={{ color: currentTheme?.colors?.primary || '#6366f1' }}
              />
            </Box>
            
            {/* Update Interval */}
            {autoUpdate && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'white' }}>
                  {isRTL ? 'فترة التحديث (دقائق)' : 'Update Interval (minutes)'}
                </InputLabel>
                <Select
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
            sx={{
              backgroundColor: currentTheme?.colors?.primary || '#6366f1',
              '&:hover': {
                backgroundColor: currentTheme?.colors?.secondary || '#5b5bd6'
              }
            }}
          >
            {isRTL ? 'حفظ' : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeatherThemes;
export { WEATHER_THEMES, MOCK_WEATHER_DATA };