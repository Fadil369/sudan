/**
 * Shared professional government card components.
 * All ministry portals import from here to enforce the design system.
 *
 * Design tokens:
 *   GOV_NAVY  #1B3A5C  – primary authority
 *   GOV_RED   #C8102E  – Sudan flag, emergency, primary CTA
 *   GOV_GREEN #007A3D  – Sudan flag, health, success
 */
import React from 'react';
import {
  Box, Card, CardContent, Typography, LinearProgress,
  Chip, Divider,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

export const GOV_NAVY  = '#1B3A5C';
export const GOV_RED   = '#C8102E';
export const GOV_GREEN = '#007A3D';

/** Ministry-specific primary colors (dark, muted — professional gov standard). */
export const MINISTRY_COLOR = {
  identity:       '#1B3A5C',
  health:         '#006B45',
  education:      '#2B2FA8',
  finance:        '#7A4B0A',
  agriculture:    '#1D6330',
  energy:         '#7A5200',
  infrastructure: '#3D1F8C',
  justice:        '#8B1A1A',
  foreign_affairs:'#055F4A',
  labor:          '#0D4A6B',
  social_welfare: '#6B1841',
};

/* ─── Portal Header ────────────────────────────────────────────────────────── */
export function GovPortalHeader({ icon, title, subtitle, color = GOV_NAVY }) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        p: 3, mb: 3, bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: `5px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: 52, height: 52, borderRadius: 1.5, flexShrink: 0,
          bgcolor: `${color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
export function GovStatCard({ value, label, color = GOV_NAVY, progress, icon }) {
  return (
    <Card
      sx={{
        height: '100%', bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderTop: `3px solid ${color}`,
        borderRadius: 2, boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                bgcolor: `${color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="h4" sx={{ color: '#111827', fontWeight: 700, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.4 }}>
          {label}
        </Typography>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1.5, height: 4, borderRadius: 2,
              bgcolor: '#F3F4F6',
              '& .MuiLinearProgress-bar': { bgcolor: color },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Service Card ──────────────────────────────────────────────────────────── */
export function GovServiceCard({ service, onClick }) {
  const C = service.color || GOV_NAVY;
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%', cursor: 'pointer', bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: `4px solid ${C}`,
        borderRadius: 2, boxShadow: 'none',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5,
              bgcolor: `${C}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C,
            }}
          >
            {service.icon}
          </Box>
          {service.badge && (
            <Chip
              label={service.badge}
              size="small"
              sx={{
                bgcolor: `${C}14`, color: C,
                fontWeight: 600, fontSize: '0.62rem',
                height: 20, borderRadius: 1,
              }}
            />
          )}
        </Box>
        <Typography variant="subtitle2" sx={{ color: '#111827', fontWeight: 700, mb: 0.5, lineHeight: 1.4 }}>
          {service.label}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280', lineHeight: 1.55, display: 'block', mb: 1.5 }}>
          {service.desc}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: C }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {service.cta || 'Apply'}
          </Typography>
          <ArrowForward sx={{ fontSize: 11 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
