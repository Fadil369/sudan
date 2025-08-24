import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  Avatar,
  Grid,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Zoom,
  Fade,
  Collapse
} from '@mui/material';
import {
  AccountTree,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  PlayArrow,
  Pause,
  Refresh,
  Settings,
  Visibility,
  VisibilityOff,
  ExpandMore,
  ExpandLess,
  Close,
  LocalHospital,
  School,
  AccountBalance,
  Agriculture,
  ElectricBolt,
  LocationCity,
  Gavel,
  Public,
  Work,
  VolunteerActivism,
  Person,
  Analytics
} from '@mui/icons-material';

// OID Tree Structure for Sudan Government
const SUDAN_OID_TREE = {
  id: 'root',
  oid: '1.3.6.1.4.1.61026',
  name: { en: 'Sudan Government OID Root', ar: 'جذر معرف الكائن للحكومة السودانية' },
  description: { en: 'Root OID for Republic of Sudan Government Digital Services', ar: 'معرف الكائن الجذري لخدمات الحكومة السودانية الرقمية' },
  icon: <AccountTree />,
  color: '#dc2626',
  level: 0,
  status: 'active',
  children: [
    {
      id: 'ministries',
      oid: '1.3.6.1.4.1.61026.1',
      name: { en: 'Government Ministries', ar: 'الوزارات الحكومية' },
      description: { en: 'All government ministries and departments', ar: 'جميع الوزارات والإدارات الحكومية' },
      icon: <Person />,
      color: '#0ea5e9',
      level: 1,
      status: 'active',
      children: [
        {
          id: 'identity',
          oid: '1.3.6.1.4.1.61026.1.1',
          name: { en: 'Identity & Civil Registry', ar: 'الهوية والسجل المدني' },
          description: { en: 'Digital identity and biometric services', ar: 'الهوية الرقمية والخدمات البيومترية' },
          icon: <Person />,
          color: '#0ea5e9',
          level: 2,
          status: 'active',
          services: 15,
          transactions: 45600
        },
        {
          id: 'health',
          oid: '1.3.6.1.4.1.61026.1.2',
          name: { en: 'Health Ministry', ar: 'وزارة الصحة' },
          description: { en: 'Healthcare services and medical records', ar: 'الخدمات الصحية والسجلات الطبية' },
          icon: <LocalHospital />,
          color: '#10b981',
          level: 2,
          status: 'active',
          services: 23,
          transactions: 78900
        },
        {
          id: 'education',
          oid: '1.3.6.1.4.1.61026.1.3',
          name: { en: 'Education Ministry', ar: 'وزارة التعليم' },
          description: { en: 'Educational services and certification', ar: 'الخدمات التعليمية والشهادات' },
          icon: <School />,
          color: '#6366f1',
          level: 2,
          status: 'active',
          services: 18,
          transactions: 34500
        },
        {
          id: 'finance',
          oid: '1.3.6.1.4.1.61026.1.4',
          name: { en: 'Finance Ministry', ar: 'وزارة المالية' },
          description: { en: 'Financial services and taxation', ar: 'الخدمات المالية والضرائب' },
          icon: <AccountBalance />,
          color: '#f59e0b',
          level: 2,
          status: 'active',
          services: 21,
          transactions: 189000
        },
        {
          id: 'agriculture',
          oid: '1.3.6.1.4.1.61026.1.5',
          name: { en: 'Agriculture Ministry', ar: 'وزارة الزراعة' },
          description: { en: 'Agricultural services and subsidies', ar: 'الخدمات الزراعية والدعم' },
          icon: <Agriculture />,
          color: '#22c55e',
          level: 2,
          status: 'active',
          services: 12,
          transactions: 67800
        }
      ]
    },
    {
      id: 'technical',
      oid: '1.3.6.1.4.1.61026.2',
      name: { en: 'Technical Infrastructure', ar: 'البنية التقنية' },
      description: { en: 'IT infrastructure and security protocols', ar: 'البنية التقنية وبروتوكولات الأمان' },
      icon: <Settings />,
      color: '#8b5cf6',
      level: 1,
      status: 'active',
      children: [
        {
          id: 'security',
          oid: '1.3.6.1.4.1.61026.2.1',
          name: { en: 'Security Protocols', ar: 'بروتوكولات الأمان' },
          description: { en: 'Encryption and authentication standards', ar: 'معايير التشفير والمصادقة' },
          icon: <Settings />,
          color: '#dc2626',
          level: 2,
          status: 'active'
        },
        {
          id: 'blockchain',
          oid: '1.3.6.1.4.1.61026.2.2',
          name: { en: 'Blockchain Network', ar: 'شبكة البلوك تشين' },
          description: { en: 'Distributed ledger for government records', ar: 'السجل الموزع للسجلات الحكومية' },
          icon: <AccountTree />,
          color: '#0891b2',
          level: 2,
          status: 'syncing'
        }
      ]
    },
    {
      id: 'analytics',
      oid: '1.3.6.1.4.1.61026.3',
      name: { en: 'Analytics & Monitoring', ar: 'التحليلات والمراقبة' },
      description: { en: 'System performance and citizen analytics', ar: 'أداء النظام وتحليلات المواطنين' },
      icon: <Analytics />,
      color: '#be185d',
      level: 1,
      status: 'active'
    }
  ]
};

// Particle system for visual effects
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.life = 1.0;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 3 + 1;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

const AnimatedOidTree = ({ isRTL = false, selectedNode: externalSelectedNode, onNodeSelect }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [showParticles, setShowParticles] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [treeLayout, setTreeLayout] = useState('circular'); // circular, hierarchical, organic
  const [showMetrics, setShowMetrics] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Animation state
  const [nodePositions, setNodePositions] = useState(new Map());
  const [connections, setConnections] = useState([]);
  const [particles, setParticles] = useState([]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [dataFlowAnimation, setDataFlowAnimation] = useState(0);

  // Flatten tree structure for easier processing
  const flattenTree = useCallback((node, parentId = null, level = 0) => {
    const result = [{ ...node, parentId, level }];
    if (node.children) {
      node.children.forEach(child => {
        result.push(...flattenTree(child, node.id, level + 1));
      });
    }
    return result;
  }, []);

  const flatNodes = useMemo(() => flattenTree(SUDAN_OID_TREE), [flattenTree]);

  // Calculate node positions based on layout
  const calculatePositions = useCallback((width, height) => {
    const positions = new Map();
    const centerX = width / 2;
    const centerY = height / 2;

    if (treeLayout === 'circular') {
      // Circular layout
      const levels = Math.max(...flatNodes.map(n => n.level)) + 1;
      const radiusStep = Math.min(width, height) / (levels * 3);

      flatNodes.forEach(node => {
        if (node.level === 0) {
          positions.set(node.id, { x: centerX, y: centerY });
        } else {
          const radius = radiusStep * (node.level + 1);
          const siblings = flatNodes.filter(n => n.level === node.level && n.parentId === node.parentId);
          const index = siblings.findIndex(n => n.id === node.id);
          const totalSiblings = siblings.length;
          const angle = (2 * Math.PI * index / totalSiblings) + (Date.now() * 0.0001 * animationSpeed);
          
          const parentPos = positions.get(node.parentId) || { x: centerX, y: centerY };
          positions.set(node.id, {
            x: parentPos.x + Math.cos(angle) * radius,
            y: parentPos.y + Math.sin(angle) * radius
          });
        }
      });
    } else if (treeLayout === 'hierarchical') {
      // Hierarchical layout
      const levels = {};
      flatNodes.forEach(node => {
        if (!levels[node.level]) levels[node.level] = [];
        levels[node.level].push(node);
      });

      Object.keys(levels).forEach(level => {
        const nodes = levels[level];
        const y = centerY + (level - 1) * 120;
        const spacing = width / (nodes.length + 1);
        
        nodes.forEach((node, index) => {
          positions.set(node.id, {
            x: spacing * (index + 1),
            y: y
          });
        });
      });
    } else {
      // Organic/flowing layout
      const time = Date.now() * 0.001 * animationSpeed;
      flatNodes.forEach((node, index) => {
        const angle = (index / flatNodes.length) * 2 * Math.PI + time;
        const radius = (node.level + 1) * 80 + Math.sin(time + index) * 20;
        positions.set(node.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius * 0.6
        });
      });
    }

    return positions;
  }, [flatNodes, treeLayout, animationSpeed]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply zoom and pan
      ctx.save();
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(centerOffset.x, centerOffset.y);

      // Calculate positions
      const positions = calculatePositions(canvas.width / zoomLevel, canvas.height / zoomLevel);
      setNodePositions(positions);

      // Draw connections
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 2;
      
      const currentConnections = [];
      flatNodes.forEach(node => {
        if (node.parentId) {
          const nodePos = positions.get(node.id);
          const parentPos = positions.get(node.parentId);
          if (nodePos && parentPos) {
            currentConnections.push({ from: parentPos, to: nodePos, color: node.color });
            
            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            
            // Add curve for organic feel
            const midX = (parentPos.x + nodePos.x) / 2;
            const midY = (parentPos.y + nodePos.y) / 2;
            const offset = Math.sin(Date.now() * 0.002 + node.id.length) * 10;
            ctx.quadraticCurveTo(midX + offset, midY + offset, nodePos.x, nodePos.y);
            ctx.stroke();

            // Data flow animation
            if (showParticles && Math.random() < 0.05) {
              const progress = (Date.now() % 3000) / 3000;
              const flowX = parentPos.x + (nodePos.x - parentPos.x) * progress;
              const flowY = parentPos.y + (nodePos.y - parentPos.y) * progress;
              particles.push(new Particle(flowX, flowY, node.color));
            }
          }
        }
      });
      setConnections(currentConnections);

      // Draw nodes
      flatNodes.forEach(node => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const baseSize = 25 + node.level * 5;
        const pulseSize = Math.sin(Date.now() * 0.005 + node.id.length) * 3;
        const size = baseSize + pulseSize + (isSelected ? 10 : 0) + (isHovered ? 5 : 0);

        // Node shadow
        ctx.save();
        ctx.shadowBlur = isSelected || isHovered ? 20 : 10;
        ctx.shadowColor = node.color;
        
        // Status indicator ring
        if (node.status === 'active') {
          ctx.strokeStyle = '#00e676';
        } else if (node.status === 'syncing') {
          ctx.strokeStyle = '#f59e0b';
        } else {
          ctx.strokeStyle = '#ef4444';
        }
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size + 5, 0, Math.PI * 2);
        ctx.stroke();

        // Main node
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, node.color + '80');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Activity indicator
        if (node.transactions && showMetrics) {
          const activityLevel = Math.min(node.transactions / 100000, 1);
          const activitySize = size * 0.3 * activityLevel;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(pos.x + size * 0.6, pos.y - size * 0.6, activitySize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Node label (only for zoomed in view)
        if (zoomLevel > 1.2) {
          ctx.fillStyle = 'white';
          ctx.font = `${12 * zoomLevel}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(
            node.name[isRTL ? 'ar' : 'en'], 
            pos.x, 
            pos.y + size + 20
          );
        }
      });

      // Update and draw particles
      if (showParticles) {
        const updatedParticles = particles.filter(particle => {
          particle.update();
          if (!particle.isDead()) {
            particle.draw(ctx);
            return true;
          }
          return false;
        });
        setParticles(updatedParticles);
      }

      ctx.restore();

      // Update animation state
      setPulsePhase(prev => (prev + 0.1) % (Math.PI * 2));
      setDataFlowAnimation(prev => (prev + 0.02) % 1);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isAnimating, 
    zoomLevel, 
    centerOffset, 
    calculatePositions, 
    selectedNode, 
    hoveredNode, 
    showParticles, 
    showMetrics,
    isRTL,
    particles
  ]);

  // Handle canvas interactions
  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel - centerOffset.x;
    const y = (event.clientY - rect.top) / zoomLevel - centerOffset.y;

    // Check if click hit any node
    for (const node of flatNodes) {
      const pos = nodePositions.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        const nodeSize = 25 + node.level * 5;
        
        if (distance <= nodeSize) {
          setSelectedNode(node);
          setIsDialogOpen(true);
          if (onNodeSelect) onNodeSelect(node);
          
          // Add particle burst effect
          if (showParticles) {
            for (let i = 0; i < 20; i++) {
              particles.push(new Particle(
                pos.x + (Math.random() - 0.5) * 40,
                pos.y + (Math.random() - 0.5) * 40,
                node.color
              ));
            }
            setParticles([...particles]);
          }
          break;
        }
      }
    }
  }, [flatNodes, nodePositions, zoomLevel, centerOffset, onNodeSelect, showParticles, particles]);

  const handleCanvasMouseMove = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel - centerOffset.x;
    const y = (event.clientY - rect.top) / zoomLevel - centerOffset.y;

    let foundHover = null;
    for (const node of flatNodes) {
      const pos = nodePositions.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        const nodeSize = 25 + node.level * 5;
        
        if (distance <= nodeSize) {
          foundHover = node;
          break;
        }
      }
    }
    
    setHoveredNode(foundHover);
    canvas.style.cursor = foundHover ? 'pointer' : 'default';
  }, [flatNodes, nodePositions, zoomLevel, centerOffset]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  const handleReset = () => {
    setZoomLevel(1);
    setCenterOffset({ x: 0, y: 0 });
  };

  const NodeDetailDialog = () => {
    if (!selectedNode) return null;

    return (
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${selectedNode.color}20 0%, rgba(0, 0, 0, 0.95) 100%)`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${selectedNode.color}`,
            borderRadius: 2,
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  backgroundColor: selectedNode.color,
                  width: 60,
                  height: 60,
                  fontSize: '1.5rem'
                }}
              >
                {selectedNode.icon}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedNode.name[isRTL ? 'ar' : 'en']}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  OID: {selectedNode.oid}
                </Typography>
                <Chip
                  label={selectedNode.status.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: selectedNode.status === 'active' ? '#00e676' : '#f59e0b',
                    color: 'black',
                    fontWeight: 600,
                    mt: 1
                  }}
                />
              </Box>
            </Box>
            <IconButton onClick={() => setIsDialogOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}>
            {selectedNode.description[isRTL ? 'ar' : 'en']}
          </Typography>

          {selectedNode.services && selectedNode.transactions && (
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ color: selectedNode.color, fontWeight: 700 }}>
                    {selectedNode.services}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {isRTL ? 'خدمات متاحة' : 'Available Services'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ color: selectedNode.color, fontWeight: 700 }}>
                    {(selectedNode.transactions / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {isRTL ? 'معاملات شهرية' : 'Monthly Transactions'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          {selectedNode.children && (
            <Box mt={3}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                {isRTL ? 'العقد الفرعية' : 'Child Nodes'}
              </Typography>
              <Grid container spacing={1}>
                {selectedNode.children.map(child => (
                  <Grid item xs={12} md={6} key={child.id}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      p={1}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                        border: `1px solid ${child.color}40`
                      }}
                    >
                      <Avatar sx={{ backgroundColor: child.color, width: 30, height: 30 }}>
                        {child.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {child.name[isRTL ? 'ar' : 'en']}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {child.oid}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: selectedNode.color,
              color: selectedNode.color,
              '&:hover': {
                borderColor: selectedNode.color,
                backgroundColor: `${selectedNode.color}20`
              }
            }}
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Controls */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {isRTL ? 'شجرة معرف الكائن المتحركة' : 'Animated OID Tree'}
          </Typography>

          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <IconButton
              onClick={() => setIsAnimating(!isAnimating)}
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              {isAnimating ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleZoomIn} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <ZoomIn />
            </IconButton>
            <IconButton onClick={handleZoomOut} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <ZoomOut />
            </IconButton>
            <IconButton onClick={handleReset} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <CenterFocusStrong />
            </IconButton>
          </Box>
        </Box>

        {/* Settings Panel */}
        <Collapse in={true}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl component="fieldset">
                  <FormLabel sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                    {isRTL ? 'تخطيط الشجرة' : 'Tree Layout'}
                  </FormLabel>
                  <RadioGroup
                    row
                    value={treeLayout}
                    onChange={(e) => setTreeLayout(e.target.value)}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }}
                  >
                    <FormControlLabel value="circular" control={<Radio size="small" />} label="Circular" />
                    <FormControlLabel value="hierarchical" control={<Radio size="small" />} label="Tree" />
                    <FormControlLabel value="organic" control={<Radio size="small" />} label="Organic" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {isRTL ? 'سرعة التحريك' : 'Animation Speed'}
                </Typography>
                <Slider
                  value={animationSpeed}
                  onChange={(e, value) => setAnimationSpeed(value)}
                  min={0.1}
                  max={3}
                  step={0.1}
                  size="small"
                  sx={{ color: '#0ea5e9' }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Box display="flex" gap={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showParticles}
                        onChange={(e) => setShowParticles(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {isRTL ? 'الجسيمات' : 'Particles'}
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showMetrics}
                        onChange={(e) => setShowMetrics(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {isRTL ? 'المقاييس' : 'Metrics'}
                      </Typography>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {isRTL ? 'انقر على عقدة لعرض التفاصيل' : 'Click on a node to view details'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Canvas */}
        <Box sx={{ position: 'relative', width: '100%', height: 600 }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.05) 0%, transparent 50%)'
            }}
          />

          {/* Legend */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              p: 2
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, mb: 1, display: 'block' }}>
              {isRTL ? 'مفتاح الرموز' : 'Legend'}
            </Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#00e676' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {isRTL ? 'نشط' : 'Active'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {isRTL ? 'مزامنة' : 'Syncing'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {isRTL ? 'نشاط عالي' : 'High Activity'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hovered Node Info */}
          {hoveredNode && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: `linear-gradient(135deg, ${hoveredNode.color}40 0%, rgba(0, 0, 0, 0.9) 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${hoveredNode.color}`,
                borderRadius: 1,
                p: 2,
                minWidth: 200,
                pointerEvents: 'none'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                {hoveredNode.name[isRTL ? 'ar' : 'en']}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {hoveredNode.oid}
              </Typography>
              {hoveredNode.transactions && (
                <Typography variant="caption" sx={{ color: hoveredNode.color, display: 'block', mt: 1 }}>
                  {(hoveredNode.transactions / 1000).toFixed(0)}K {isRTL ? 'معاملة/شهر' : 'transactions/month'}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <NodeDetailDialog />
      </CardContent>
    </Card>
  );
};

export default AnimatedOidTree;