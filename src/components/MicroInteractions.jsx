import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Fade,
  Zoom,
  Slide,
  Grow,
  Collapse,
  Avatar,
  Chip,
  Tooltip
} from '@mui/material';
import {
  FavoriteRounded,
  StarRounded,
  ThumbUpRounded,
  CelebrationRounded,
  LocalFireDepartmentRounded,
  FlightTakeoffRounded,
  AutoAwesomeRounded,
  DiamondRounded,
  WavesRounded
} from '@mui/icons-material';

// Sudanese Cultural Patterns
const SUDANESE_PATTERNS = {
  geometric: {
    name: 'Geometric',
    path: 'M0,0 L10,0 L10,5 L5,5 L5,10 L0,10 Z M15,0 L25,0 L25,5 L20,5 L20,10 L15,10 Z',
    colors: ['#dc2626', '#000000', '#ffffff']
  },
  arabesque: {
    name: 'Arabesque',
    path: 'M12.5,0 Q25,6.25 12.5,12.5 Q0,6.25 12.5,0 Z M12.5,12.5 Q25,18.75 12.5,25 Q0,18.75 12.5,12.5 Z',
    colors: ['#f59e0b', '#dc2626', '#10b981']
  },
  tribal: {
    name: 'Tribal',
    path: 'M5,0 L10,5 L15,0 L20,5 L25,0 L20,10 L15,5 L10,10 L5,5 L0,10 Z',
    colors: ['#8b5cf6', '#be185d', '#ea580c']
  }
};

// Interactive Button with Cultural Animations
const CulturalButton = ({ 
  children, 
  onClick, 
  variant = 'contained',
  color = 'primary',
  pattern = 'geometric',
  disabled = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [patternAnimation, setPatternAnimation] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Create ripple effect
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      scale: 0
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Animate ripple
    setTimeout(() => {
      setRipples(prev => prev.map(ripple => 
        ripple.id === newRipple.id ? { ...ripple, scale: 1 } : ripple
      ));
    }, 10);
    
    // Remove ripple
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    // Trigger pattern animation
    setPatternAnimation(true);
    setTimeout(() => setPatternAnimation(false), 800);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const patternData = SUDANESE_PATTERNS[pattern];

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={onClick}
      disabled={disabled}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transform: isPressed ? 'scale(0.98) translateY(1px)' : 'scale(1) translateY(0px)',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        background: variant === 'contained' 
          ? `linear-gradient(135deg, ${patternData.colors[0]} 0%, ${patternData.colors[1]} 100%)`
          : 'transparent',
        borderColor: patternData.colors[0],
        color: variant === 'contained' ? 'white' : patternData.colors[0],
        '&:hover': {
          transform: 'scale(1.02) translateY(-1px)',
          boxShadow: `0 8px 25px ${patternData.colors[0]}40`,
          '&::before': {
            opacity: 0.1
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
              <path d="${patternData.path}" fill="${patternData.colors[2]}" opacity="0.2"/>
            </svg>
          `)}")`,
          backgroundSize: '25px 25px',
          opacity: patternAnimation ? 0.3 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        },
        ...props.sx
      }}
      {...props}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <Box
          key={ripple.id}
          sx={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: `translate(-50%, -50%) scale(${ripple.scale})`,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'currentColor',
              opacity: 0.3,
              transform: 'translate(-50%, -50%)'
            }
          }}
        />
      ))}
      
      {children}
    </Button>
  );
};

// Floating Celebration Particles
const CelebrationParticles = ({ active, colors = ['#dc2626', '#f59e0b', '#10b981'] }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      shape: Math.random() > 0.5 ? 'circle' : 'star'
    }));
    
    setParticles(newParticles);
    
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.02,
        size: p.size * 0.995
      })).filter(p => p.life > 0));
    }, 16);

    const timeout = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active, colors]);

  if (particles.length === 0) return null;

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
            borderRadius: particle.shape === 'circle' ? '50%' : 0,
            opacity: particle.life,
            transform: particle.shape === 'star' 
              ? 'rotate(45deg)' 
              : `scale(${particle.life})`,
            transition: 'all 0.016s linear',
            '&::before': particle.shape === 'star' ? {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              backgroundColor: 'inherit',
              transform: 'translate(-50%, -50%) rotate(45deg)'
            } : {}
          }}
        />
      ))}
    </Box>
  );
};

// Success Wave Animation
const SuccessWave = ({ trigger, color = '#10b981' }) => {
  const [waves, setWaves] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newWave = {
      id: Date.now(),
      scale: 0,
      opacity: 1
    };

    setWaves(prev => [...prev, newWave]);

    // Animate wave
    setTimeout(() => {
      setWaves(prev => prev.map(wave => 
        wave.id === newWave.id 
          ? { ...wave, scale: 2, opacity: 0 }
          : wave
      ));
    }, 10);

    // Remove wave
    setTimeout(() => {
      setWaves(prev => prev.filter(wave => wave.id !== newWave.id));
    }, 1000);
  }, [trigger]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9998
      }}
    >
      {waves.map(wave => (
        <Box
          key={wave.id}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '100vw',
            border: `4px solid ${color}`,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) scale(${wave.scale})`,
            opacity: wave.opacity,
            transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        />
      ))}
    </Box>
  );
};

// Interactive Card with Hover Effects
const InteractiveCard = ({ 
  children, 
  elevation = 2,
  pattern = 'geometric',
  onHover,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTransformOrigin(`${x}% ${y}%`);
    
    if (onHover) onHover({ x, y, isHovered });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformOrigin('center center');
  };

  const patternData = SUDANESE_PATTERNS[pattern];

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transform: isHovered 
          ? 'translateY(-8px) scale(1.02)' 
          : 'translateY(0px) scale(1)',
        transformOrigin,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered 
          ? `0 20px 40px ${patternData.colors[0]}20, 0 0 0 1px ${patternData.colors[0]}40`
          : `0 ${elevation * 2}px ${elevation * 8}px rgba(0, 0, 0, 0.1)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(45deg, ${patternData.colors[0]}, ${patternData.colors[1]}, ${patternData.colors[2] || patternData.colors[0]})`,
          borderRadius: 'inherit',
          opacity: isHovered ? 0.1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: -1
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transform: isHovered ? 'translateX(200%)' : 'translateX(-100%)',
          transition: 'transform 0.6s ease',
          pointerEvents: 'none'
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

// Cultural Loading Spinner
const CulturalSpinner = ({ size = 40, pattern = 'geometric', isLoading = false }) => {
  const patternData = SUDANESE_PATTERNS[pattern];
  
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{
          animation: 'rotate 2s linear infinite'
        }}
      >
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={patternData.colors[0]} />
            <stop offset="50%" stopColor={patternData.colors[1]} />
            <stop offset="100%" stopColor={patternData.colors[2] || patternData.colors[0]} />
          </linearGradient>
        </defs>
        
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          style={{
            animation: 'dash 1.5s ease-in-out infinite'
          }}
        />
        
        <style jsx>{`
          @keyframes rotate {
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes dash {
            0% {
              stroke-dasharray: 1, 150;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -124;
            }
          }
        `}</style>
      </svg>
    </Box>
  );
};

// Animated Counter
const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  prefix = '', 
  suffix = '',
  format = 'number',
  ...props 
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (typeof value !== 'number') return;
    
    setIsAnimating(true);
    startTimeRef.current = Date.now();
    startValueRef.current = currentValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easedProgress = progress < 0.5 
        ? 4 * progress ** 3 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const newValue = startValueRef.current + (value - startValueRef.current) * easedProgress;
      setCurrentValue(newValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    } else if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    } else {
      return Math.floor(val).toLocaleString();
    }
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        ...props.sx
      }}
      {...props}
    >
      {prefix}{formatValue(currentValue)}{suffix}
    </Box>
  );
};

// Main MicroInteractions component showcasing all interactions
const MicroInteractions = ({ isRTL = false }) => {
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [successWaveTrigger, setSuccessWaveTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [counterValue, setCounterValue] = useState(1250);

  const triggerCelebration = () => {
    setCelebrationActive(true);
    setTimeout(() => setCelebrationActive(false), 3000);
  };

  const triggerSuccessWave = () => {
    setSuccessWaveTrigger(Date.now());
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const incrementCounter = () => {
    setCounterValue(prev => prev + Math.floor(Math.random() * 500) + 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Global Effects */}
      <CelebrationParticles active={celebrationActive} />
      <SuccessWave trigger={successWaveTrigger} />

      <Typography variant="h4" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
        {isRTL ? 'التفاعلات الدقيقة والرسوم المتحركة الثقافية' : 'Micro-Interactions & Cultural Animations'}
      </Typography>

      {/* Interactive Buttons Section */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {isRTL ? 'الأزرار التفاعلية مع الأنماط الثقافية' : 'Interactive Buttons with Cultural Patterns'}
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <CulturalButton 
              pattern="geometric" 
              onClick={triggerCelebration}
              startIcon={<CelebrationRounded />}
            >
              {isRTL ? 'احتفال' : 'Celebrate'}
            </CulturalButton>
            
            <CulturalButton 
              pattern="arabesque" 
              variant="outlined"
              onClick={triggerSuccessWave}
              startIcon={<AutoAwesomeRounded />}
            >
              {isRTL ? 'موجة نجاح' : 'Success Wave'}
            </CulturalButton>
            
            <CulturalButton 
              pattern="tribal" 
              onClick={handleLoadingDemo}
              startIcon={<FlightTakeoffRounded />}
              disabled={isLoading}
            >
              {isLoading ? (
                <CulturalSpinner size={20} pattern="tribal" isLoading />
              ) : (
                isRTL ? 'تحميل' : 'Loading Demo'
              )}
            </CulturalButton>
          </Box>
        </CardContent>
      </Card>

      {/* Interactive Cards Section */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {isRTL ? 'بطاقات تفاعلية' : 'Interactive Cards'}
          </Typography>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
            {['geometric', 'arabesque', 'tribal'].map((pattern, index) => (
              <InteractiveCard 
                key={pattern}
                pattern={pattern}
                onClick={() => triggerCelebration()}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ backgroundColor: SUDANESE_PATTERNS[pattern].colors[0] }}>
                      {index === 0 ? <DiamondRounded /> : index === 1 ? <StarRounded /> : <LocalFireDepartmentRounded />}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {SUDANESE_PATTERNS[pattern].name} Pattern
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {isRTL ? 'انقر للتفاعل مع هذا النمط الثقافي' : 'Click to interact with this cultural pattern'}
                  </Typography>
                </CardContent>
              </InteractiveCard>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Animated Counters Section */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {isRTL ? 'عدادات متحركة' : 'Animated Counters'}
          </Typography>
          
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 700 }}>
                <AnimatedCounter value={counterValue} />
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isRTL ? 'المستخدمون النشطون' : 'Active Users'}
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                <AnimatedCounter value={counterValue * 2.5} format="currency" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isRTL ? 'إجمالي المعاملات' : 'Total Transactions'}
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h3" sx={{ color: '#6366f1', fontWeight: 700 }}>
                <AnimatedCounter value={95.8} format="percentage" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {isRTL ? 'معدل الرضا' : 'Satisfaction Rate'}
              </Typography>
            </Box>
          </Box>
          
          <Box textAlign="center" mt={3}>
            <CulturalButton pattern="geometric" onClick={incrementCounter}>
              {isRTL ? 'تحديث الإحصائيات' : 'Update Stats'}
            </CulturalButton>
          </Box>
        </CardContent>
      </Card>

      {/* Loading States Section */}
      <Card sx={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
            {isRTL ? 'رسوم التحميل الثقافية' : 'Cultural Loading Animations'}
          </Typography>
          
          <Box display="flex" gap={4} alignItems="center" justifyContent="center">
            <Box textAlign="center">
              <CulturalSpinner pattern="geometric" isLoading size={60} />
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: 1 }}>
                Geometric
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <CulturalSpinner pattern="arabesque" isLoading size={60} />
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: 1 }}>
                Arabesque
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <CulturalSpinner pattern="tribal" isLoading size={60} />
              <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: 1 }}>
                Tribal
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          {isRTL 
            ? 'تفاعل مع العناصر أعلاه لرؤية الرسوم المتحركة والتأثيرات الثقافية'
            : 'Interact with the elements above to see the cultural animations and effects'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default MicroInteractions;
export { CulturalButton, InteractiveCard, CulturalSpinner, AnimatedCounter, CelebrationParticles, SuccessWave };