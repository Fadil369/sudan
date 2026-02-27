import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LandingPage from './pages/LandingPage';
import SudanGovPortal from './pages/SudanGovPortal';
import AuthProvider from './components/AuthProvider';
import SecureErrorBoundary from './components/SecureErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2563eb' },
  },
});

const App = () => (
  <SecureErrorBoundary>
    <ThemeProvider theme={theme}>
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
