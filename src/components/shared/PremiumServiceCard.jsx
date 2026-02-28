import { Card, CardContent, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import { ArrowForward, Star } from '@mui/icons-material';

/**
 * Premium Service Card Component
 * Reusable across all ministry portals
 */
export default function PremiumServiceCard({
  title,
  description,
  icon: Icon,
  color = '#1976d2',
  badge = null,
  stats = [],
  actions = [],
  featured = false,
  onClick,
  language = 'en',
}) {
  const isRTL = language === 'ar';

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: featured ? `2px solid ${color}` : '1px solid #e0e0e0',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${color}20`,
          borderColor: color,
        } : {},
        '&::before': featured ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
              },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 32, color }} />}
          </Box>

          {featured && (
            <Chip
              icon={<Star sx={{ fontSize: 16 }} />}
              label={isRTL ? 'مميز' : 'Featured'}
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {/* Title & Description */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}
        >
          {description}
        </Typography>

        {/* Badge */}
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              mb: 2,
              alignSelf: 'flex-start',
              backgroundColor: `${color}10`,
              color,
              fontWeight: 600,
            }}
          />
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            {stats.map((stat, idx) => (
              <Box key={idx}>
                <Typography variant="h6" sx={{ fontWeight: 700, color }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <Box display="flex" gap={1} mt={2}>
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={idx === 0 ? 'contained' : 'outlined'}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(idx === 0 && {
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${color}dd 0%, ${color}bb 100%)`,
                    },
                  }),
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
