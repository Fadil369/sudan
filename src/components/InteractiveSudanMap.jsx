import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { Close, LocationOn, People, Business, TrendingUp } from '@mui/icons-material';

const InteractiveSudanMap = ({ language = 'en', isRTL = false }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [viewMode, setViewMode] = useState('services'); // services, population, digital, activity
  const [animationKey, setAnimationKey] = useState(0);

  // Sudan states data
  const sudanStates = useMemo(() => [
    {
      id: 'khartoum',
      name: language === 'ar' ? 'الخرطوم' : 'Khartoum',
      population: 5274321,
      digitalAdoption: 78,
      activeServices: 145,
      coordinates: { x: 60, y: 45 },
      color: '#ce1126',
      services: ['health', 'education', 'finance', 'justice', 'infrastructure']
    },
    {
      id: 'kassala',
      name: language === 'ar' ? 'كسلا' : 'Kassala',
      population: 1789373,
      digitalAdoption: 45,
      activeServices: 87,
      coordinates: { x: 85, y: 50 },
      color: '#2196f3',
      services: ['health', 'education', 'agriculture']
    },
    {
      id: 'gedaref',
      name: language === 'ar' ? 'القضارف' : 'Gedaref',
      population: 1348378,
      digitalAdoption: 52,
      activeServices: 76,
      coordinates: { x: 75, y: 60 },
      color: '#4caf50',
      services: ['agriculture', 'health', 'education']
    },
    {
      id: 'blue_nile',
      name: language === 'ar' ? 'النيل الأزرق' : 'Blue Nile',
      population: 727405,
      digitalAdoption: 38,
      activeServices: 45,
      coordinates: { x: 65, y: 70 },
      color: '#ff9800',
      services: ['agriculture', 'infrastructure', 'health']
    },
    {
      id: 'white_nile',
      name: language === 'ar' ? 'النيل الأبيض' : 'White Nile',
      population: 1188707,
      digitalAdoption: 41,
      activeServices: 63,
      coordinates: { x: 50, y: 65 },
      color: '#9c27b0',
      services: ['agriculture', 'health', 'education']
    },
    {
      id: 'river_nile',
      name: language === 'ar' ? 'نهر النيل' : 'River Nile',
      population: 1027580,
      digitalAdoption: 55,
      activeServices: 71,
      coordinates: { x: 45, y: 35 },
      color: '#00bcd4',
      services: ['tourism', 'health', 'education']
    },
    {
      id: 'red_sea',
      name: language === 'ar' ? 'البحر الأحمر' : 'Red Sea',
      population: 1482053,
      digitalAdoption: 49,
      activeServices: 68,
      coordinates: { x: 90, y: 40 },
      color: '#f44336',
      services: ['tourism', 'infrastructure', 'health']
    },
    {
      id: 'northern',
      name: language === 'ar' ? 'الشمالية' : 'Northern',
      population: 721164,
      digitalAdoption: 43,
      activeServices: 52,
      coordinates: { x: 40, y: 15 },
      color: '#795548',
      services: ['tourism', 'infrastructure']
    },
    {
      id: 'north_kordofan',
      name: language === 'ar' ? 'شمال كردفان' : 'North Kordofan',
      population: 2920992,
      digitalAdoption: 36,
      activeServices: 94,
      coordinates: { x: 35, y: 55 },
      color: '#607d8b',
      services: ['agriculture', 'health', 'education']
    },
    {
      id: 'south_kordofan',
      name: language === 'ar' ? 'جنوب كردفان' : 'South Kordofan',
      population: 1406404,
      digitalAdoption: 31,
      activeServices: 58,
      coordinates: { x: 40, y: 75 },
      color: '#8bc34a',
      services: ['agriculture', 'health']
    },
    {
      id: 'north_darfur',
      name: language === 'ar' ? 'شمال دارفور' : 'North Darfur',
      population: 2751000,
      digitalAdoption: 25,
      activeServices: 67,
      coordinates: { x: 15, y: 30 },
      color: '#ff5722',
      services: ['health', 'education', 'infrastructure']
    },
    {
      id: 'west_darfur',
      name: language === 'ar' ? 'غرب دارفور' : 'West Darfur',
      population: 1775000,
      digitalAdoption: 22,
      activeServices: 41,
      coordinates: { x: 10, y: 45 },
      color: '#9e9e9e',
      services: ['health', 'education']
    },
    {
      id: 'south_darfur',
      name: language === 'ar' ? 'جنوب دارفور' : 'South Darfur',
      population: 4093000,
      digitalAdoption: 28,
      activeServices: 89,
      coordinates: { x: 20, y: 60 },
      color: '#673ab7',
      services: ['health', 'education', 'agriculture']
    },
    {
      id: 'east_darfur',
      name: language === 'ar' ? 'شرق دارفور' : 'East Darfur',
      population: 1520000,
      digitalAdoption: 26,
      activeServices: 53,
      coordinates: { x: 25, y: 50 },
      color: '#ffc107',
      services: ['health', 'agriculture']
    },
    {
      id: 'central_darfur',
      name: language === 'ar' ? 'وسط دارفور' : 'Central Darfur',
      population: 1350000,
      digitalAdoption: 24,
      activeServices: 47,
      coordinates: { x: 18, y: 40 },
      color: '#cddc39',
      services: ['health', 'education']
    },
    {
      id: 'sennar',
      name: language === 'ar' ? 'سنار' : 'Sennar',
      population: 1285058,
      digitalAdoption: 44,
      activeServices: 69,
      coordinates: { x: 55, y: 70 },
      color: '#03a9f4',
      services: ['agriculture', 'health', 'education']
    },
    {
      id: 'west_kordofan',
      name: language === 'ar' ? 'غرب كردفان' : 'West Kordofan',
      population: 1431377,
      digitalAdoption: 33,
      activeServices: 56,
      coordinates: { x: 28, y: 65 },
      color: '#e91e63',
      services: ['agriculture', 'health']
    },
    {
      id: 'gezira',
      name: language === 'ar' ? 'الجزيرة' : 'Gezira',
      population: 3575280,
      digitalAdoption: 62,
      activeServices: 108,
      coordinates: { x: 50, y: 55 },
      color: '#009688',
      services: ['agriculture', 'health', 'education', 'finance']
    }
  ], [language]);

  const getActivityIntensity = (state) => {
    switch(viewMode) {
      case 'services':
        return Math.min(state.activeServices / 150, 1);
      case 'population':
        return Math.min(state.population / 5000000, 1);
      case 'digital':
        return state.digitalAdoption / 100;
      case 'activity':
        return Math.random() * 0.8 + 0.2; // Simulated real-time activity
      default:
        return 0.5;
    }
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
  };

  const handleCloseDialog = () => {
    setSelectedState(null);
  };

  // Simulate real-time updates for activity mode
  useEffect(() => {
    let interval;
    if (viewMode === 'activity') {
      interval = setInterval(() => {
        setAnimationKey(prev => prev + 1);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [viewMode]);

  const viewModeButtons = [
    { key: 'services', label: language === 'ar' ? 'الخدمات' : 'Services', icon: Business },
    { key: 'population', label: language === 'ar' ? 'السكان' : 'Population', icon: People },
    { key: 'digital', label: language === 'ar' ? 'التحول الرقمي' : 'Digital Adoption', icon: TrendingUp },
    { key: 'activity', label: language === 'ar' ? 'النشاط المباشر' : 'Live Activity', icon: LocationOn }
  ];

  return (
    <Card sx={{ 
      height: '100%', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {language === 'ar' ? 'خريطة السودان التفاعلية' : 'Interactive Sudan Map'}
        </Typography>

        {/* View Mode Selector */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {viewModeButtons.map(({ key, label, icon: Icon }) => (
            <Chip
              key={key}
              label={label}
              icon={<Icon />}
              onClick={() => setViewMode(key)}
              variant={viewMode === key ? 'filled' : 'outlined'}
              color={viewMode === key ? 'primary' : 'default'}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          ))}
        </Box>

        {/* SVG Map */}
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 400,
          overflow: 'hidden',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <svg
            viewBox="0 0 100 100"
            style={{
              width: '100%',
              height: '100%',
              cursor: 'pointer'
            }}
            key={animationKey}
          >
            {/* Background */}
            <rect width="100" height="100" fill="url(#mapGradient)" />
            
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1e3c72' }} />
                <stop offset="100%" style={{ stopColor: '#2a5298' }} />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="pulse">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* State Markers */}
            {sudanStates.map((state) => {
              const intensity = getActivityIntensity(state);
              const radius = 2 + intensity * 3;
              const opacity = 0.6 + intensity * 0.4;

              return (
                <g key={state.id}>
                  {/* Pulse animation for active states */}
                  {viewMode === 'activity' && intensity > 0.5 && (
                    <circle
                      cx={state.coordinates.x}
                      cy={state.coordinates.y}
                      r={radius + 2}
                      fill={state.color}
                      opacity={0.3}
                    >
                      <animate
                        attributeName="r"
                        values={`${radius};${radius + 4};${radius}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0.1;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* State Circle */}
                  <circle
                    cx={state.coordinates.x}
                    cy={state.coordinates.y}
                    r={radius}
                    fill={state.color}
                    opacity={opacity}
                    filter="url(#glow)"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleStateClick(state)}
                  >
                    <animate
                      attributeName="r"
                      values={`${radius};${radius + 0.5};${radius}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* State Label */}
                  <text
                    x={state.coordinates.x}
                    y={state.coordinates.y + radius + 3}
                    textAnchor="middle"
                    fontSize="2"
                    fill="white"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {state.name}
                  </text>
                </g>
              );
            })}

            {/* Activity Flow Lines (for activity mode) */}
            {viewMode === 'activity' && sudanStates.map((state, index) => {
              if (index === 0) return null;
              const previousState = sudanStates[0]; // Khartoum as central hub
              
              return (
                <line
                  key={`flow-${state.id}`}
                  x1={previousState.coordinates.x}
                  y1={previousState.coordinates.y}
                  x2={state.coordinates.x}
                  y2={state.coordinates.y}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="0.2"
                  strokeDasharray="1,1"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;2"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </line>
              );
            })}
          </svg>
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {language === 'ar' ? 'انقر على أي ولاية لعرض التفاصيل' : 'Click on any state to view details'}
          </Typography>
        </Box>
      </CardContent>

      {/* State Detail Dialog */}
      <Dialog
        open={!!selectedState}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedState && (
          <>
            <DialogTitle sx={{ 
              bgcolor: selectedState.color, 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">{selectedState.name}</Typography>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {selectedState.population.toLocaleString()}
                    </Typography>
                    <Typography variant="caption">
                      {language === 'ar' ? 'عدد السكان' : 'Population'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {selectedState.activeServices}
                    </Typography>
                    <Typography variant="caption">
                      {language === 'ar' ? 'الخدمات النشطة' : 'Active Services'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {language === 'ar' ? 'التحول الرقمي' : 'Digital Adoption'}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedState.digitalAdoption}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedState.digitalAdoption}%
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {language === 'ar' ? 'الخدمات المتاحة' : 'Available Services'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedState.services.map((service) => (
                      <Chip 
                        key={service}
                        label={service}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default InteractiveSudanMap;