import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

/**
 * Premium Stats Card Component
 * Beautiful animated statistics display
 */
export default function PremiumStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#1976d2',
  trend = null, // { value: '+12%', direction: 'up' }
  progress = null, // { value: 75, label: '75% complete' }
  variant = 'default', // 'default' | 'gradient' | 'outlined'
}) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: variant === 'gradient'
          ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
          : variant === 'outlined'
          ? 'white'
          : '#ffffff',
        border: variant === 'outlined' ? `2px solid ${color}20` : 'none',
        boxShadow: variant === 'gradient'
          ? `0 8px 24px ${color}30`
          : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: variant === 'gradient'
            ? `0 12px 32px ${color}40`
            : '0 4px 16px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Icon */}
      {Icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: variant === 'gradient'
              ? 'rgba(255,255,255,0.2)'
              : `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Icon
            sx={{
              fontSize: 28,
              color: variant === 'gradient' ? 'white' : color,
            }}
          />
        </Box>
      )}

      {/* Title */}
      <Typography
        variant="body2"
        sx={{
          color: variant === 'gradient' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
          fontWeight: 500,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Value */}
      <Box display="flex" alignItems="baseline" gap={1} mb={1}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: variant === 'gradient' ? 'white' : color,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>

        {/* Trend */}
        {trend && (
          <Chip
            icon={trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
            label={trend.value}
            size="small"
            sx={{
              height: 24,
              backgroundColor: trend.direction === 'up'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              color: trend.direction === 'up' ? '#16a34a' : '#dc2626',
              fontWeight: 700,
              '& .MuiChip-icon': {
                fontSize: 16,
              },
            }}
          />
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: variant === 'gradient' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
          }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Progress */}
      {progress && (
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography
              variant="caption"
              sx={{
                color: variant === 'gradient' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              }}
            >
              {progress.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: variant === 'gradient' ? 'white' : color,
                fontWeight: 700,
              }}
            >
              {progress.value}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.value}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: variant === 'gradient'
                ? 'rgba(255,255,255,0.2)'
                : `${color}20`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: variant === 'gradient'
                  ? 'white'
                  : `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
