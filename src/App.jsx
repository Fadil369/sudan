import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './pages/LandingPage';
import SudanGovPortal from './pages/SudanGovPortal';
import AuthProvider from './components/AuthProvider';
import SecureErrorBoundary from './components/SecureErrorBoundary';

/* ── Sudan Digital Government – Professional Light Theme ────────────────────
   Colour palette uses the Republic of Sudan flag colours:
     Primary navy  #1B3A5C  (authority & structure)
     Accent red    #C8102E  (flag red, CTA, emergency)
     Accent green  #007A3D  (flag green, success)
   All surfaces are white/near-white; no gradients, no glass effects.
 ─────────────────────────────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: '#1B3A5C', dark: '#0F2640', light: '#2D5A8E', contrastText: '#fff' },
    secondary:  { main: '#C8102E', dark: '#9B0C22', contrastText: '#fff' },
    success:    { main: '#007A3D' },
    warning:    { main: '#B45309' },
    error:      { main: '#B91C1C' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text:       { primary: '#111827', secondary: '#6B7280', disabled: '#9CA3AF' },
    divider:    '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Cairo", "Noto Sans Arabic", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#F5F7FA' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: 'none' } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderRadius: 6,
          boxShadow: 'none', '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip:         { styleOverrides: { root: { borderRadius: 4, fontWeight: 500 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiTab:          { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
    MuiTableCell:    { styleOverrides: { head: { fontWeight: 600, color: '#374151' } } },
    MuiPaper:        { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #E5E7EB' } } },
  },
});

const App = () => (
  <SecureErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing page — default entry point */}
          <Route path="/" element={<LandingPage />} />

          {/* Government portal — full-featured portal app */}
          <Route
            path="/portal"
            element={
              <AuthProvider>
                <SudanGovPortal />
              </AuthProvider>
            }
          />

          {/* Catch-all: redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </SecureErrorBoundary>
);

export default App;
