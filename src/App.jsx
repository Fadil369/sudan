import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AccessibilityProvider } from './components/AccessibilityProvider';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SudanGovPortal = lazy(() => import('./pages/SudanGovPortal'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DocumentationHub = lazy(() => import('./components/DocumentationHub'));

// Loading fallback component
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={60} />
  </Box>
);

// Sudan Government Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#388e3c', // Green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccessibilityProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/portal" element={<SudanGovPortal />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Documentation */}
              <Route path="/docs" element={<DocumentationHub />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Ministry Routes */}
              <Route path="/portal/health" element={<SudanGovPortal defaultTab="health" />} />
              <Route path="/portal/education" element={<SudanGovPortal defaultTab="education" />} />
              <Route path="/portal/finance" element={<SudanGovPortal defaultTab="finance" />} />
              <Route path="/portal/justice" element={<SudanGovPortal defaultTab="justice" />} />
              <Route path="/portal/foreign-affairs" element={<SudanGovPortal defaultTab="foreign_affairs" />} />
              <Route path="/portal/labor" element={<SudanGovPortal defaultTab="labor" />} />
              <Route path="/portal/social-welfare" element={<SudanGovPortal defaultTab="social_welfare" />} />
              <Route path="/portal/agriculture" element={<SudanGovPortal defaultTab="agriculture" />} />
              <Route path="/portal/energy" element={<SudanGovPortal defaultTab="energy" />} />
              <Route path="/portal/infrastructure" element={<SudanGovPortal defaultTab="infrastructure" />} />
              <Route path="/portal/identity" element={<SudanGovPortal defaultTab="identity" />} />
              
              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
