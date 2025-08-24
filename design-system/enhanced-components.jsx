/**
 * Enhanced Government Portal Components
 * Modern UI components with improved visual design
 */

import React from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, LinearProgress } from '@mui/material';

// Enhanced Service Card Component
export const EnhancedServiceCard = ({ 
  service, 
  isRTL = false, 
  onClick,
  showNotifications = true,
  showProgress = true 
}) => {
  const progressValue = (service.metrics?.users / 12500000) * 100;
  
  return (
    <Card
      className="service-category-card"
      onClick={() => onClick(service)}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        background: `linear-gradient(135deg, ${service.color}08 0%, ${service.color}03 100%)`,
        border: `1px solid ${service.color}20`,
        borderLeft: `4px solid ${service.color}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${service.color}25`,
          borderColor: `${service.color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle, ${service.color}15 0%, transparent 70%)`,
          borderRadius: '0 0 0 80px',
        }
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {/* Service Icon and Status */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.8rem',
              boxShadow: `0 8px 20px ${service.color}40`,
            }}
          >
            {service.icon}
          </Box>
          
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            {service.priority === 'critical' && (
              <Box className="priority-urgent">
                <Chip
                  label={isRTL ? 'حرج' : 'Critical'}
                  size="small"
                  sx={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    animation: 'urgent-pulse 1.5s infinite'
                  }}
                />
              </Box>
            )}
            
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: 'text.secondary',
                opacity: 0.8
              }}
            >
              {service.oidBranch}
            </Typography>
          </Box>
        </Box>

        {/* Service Title and Description */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: '1.2rem',
            lineHeight: 1.3,
            background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}AA 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {service.nameShort}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2.5,
            fontSize: '0.9rem',
            lineHeight: 1.5,
            opacity: 0.8
          }}
        >
          {service.services?.slice(0, 3).join(' • ')}
        </Typography>

        {/* Enhanced Progress Section */}
        {showProgress && service.metrics && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                {isRTL ? 'المستخدمون النشطون' : 'Active Users'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: service.color, 
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {(service.metrics.users / 1000000).toFixed(1)}M
              </Typography>
            </Box>
            
            <Box className="sudan-progress-modern">
              <Box 
                className="progress-fill"
                sx={{
                  width: `${progressValue}%`,
                  background: `linear-gradient(90deg, ${service.color}, ${service.color}DD)`,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Status and Satisfaction */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box className="status-indicator status-online">
            <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
              {isRTL ? 'متاح' : 'Online'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: service.metrics?.satisfaction >= 4.5 ? '#10B981' : '#F59E0B'
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              ★ {service.metrics?.satisfaction || 'N/A'}/5
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      {/* Sudan Flag Pattern at Bottom */}
      <Box className="sudan-flag-pattern" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
    </Card>
  );
};

// Enhanced Status Card Component
export const EnhancedStatusCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#CE1126', 
  trend,
  isRTL = false 
}) => {
  return (
    <Card className="sudan-glass-panel" sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{ fontSize: 56, color: color, mb: 1.5, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
          {icon}
        </Box>
        
        <Typography 
          variant="h3" 
          sx={{ 
            color: 'white', 
            fontWeight: 800, 
            mb: 1,
            fontSize: '2.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mb: 1.5,
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
        
        {trend && (
          <Chip
            label={trend}
            size="small"
            sx={{
              backgroundColor: trend.includes('+') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: trend.includes('+') ? '#10B981' : '#EF4444',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: `1px solid ${trend.includes('+') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          />
        )}
        
        {/* Subtle Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: `radial-gradient(circle, ${color}20 0%, transparent 60%)`,
            borderRadius: '0 12px 0 120px',
            zIndex: -1
          }}
        />
      </CardContent>
    </Card>
  );
};

// Enhanced Quick Action Button
export const EnhancedQuickAction = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'primary',
  isRTL = false 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emergency':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
          }
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
            boxShadow: '0 8px 25px rgba(30, 64, 175, 0.4)',
          }
        };
      default:
        return {
          background: 'linear-gradient(135deg, #CE1126 0%, #B91C3C 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #B91C3C 0%, #991B1B 100%)',
            boxShadow: '0 8px 25px rgba(206, 17, 38, 0.4)',
          }
        };
    }
  };

  return (
    <Button
      className="sudan-btn-modern"
      onClick={onClick}
      sx={{
        width: '100%',
        py: 2,
        flexDirection: 'column',
        gap: 1,
        borderRadius: '16px',
        ...getVariantStyles(),
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          ...getVariantStyles()['&:hover']
        },
        '&:active': {
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Box sx={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
        {icon}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'center',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {label}
      </Typography>
    </Button>
  );
};

// Enhanced Navigation Item
export const EnhancedNavItem = ({ 
  icon, 
  label, 
  active = false, 
  onClick, 
  badge,
  isRTL = false 
}) => {
  return (
    <Box
      className={`sudan-nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        position: 'relative',
        overflow: 'hidden',
        background: active 
          ? 'linear-gradient(90deg, rgba(206, 17, 38, 0.15) 0%, rgba(206, 17, 38, 0.08) 100%)'
          : 'transparent',
        borderLeft: active ? '4px solid #CE1126' : '4px solid transparent',
        '&:hover': {
          background: 'rgba(206, 17, 38, 0.08)',
          transform: 'translateX(8px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: active ? 0 : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(206, 17, 38, 0.1), transparent)',
          transition: 'left 0.5s ease',
        }
      }}
    >
      <Box sx={{ fontSize: '1.5rem', color: active ? '#CE1126' : 'rgba(255, 255, 255, 0.7)' }}>
        {icon}
      </Box>
      
      <Typography
        variant="body2"
        sx={{
          color: active ? 'white' : 'rgba(255, 255, 255, 0.9)',
          fontWeight: active ? 600 : 500,
          fontSize: '0.95rem'
        }}
      >
        {label}
      </Typography>
      
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            ml: 'auto',
            backgroundColor: 'rgba(206, 17, 38, 0.2)',
            color: '#CE1126',
            fontSize: '0.75rem',
            height: 20,
            fontWeight: 600
          }}
        />
      )}
    </Box>
  );
};

export default {
  EnhancedServiceCard,
  EnhancedStatusCard,
  EnhancedQuickAction,
  EnhancedNavItem
};