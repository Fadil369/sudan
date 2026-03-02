import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import './styles/sudan-government.css';

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
export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1B3A5C',
      light: '#2D5A8E',
      dark: '#0F2640',
    },
    secondary: {
      main: '#007A3D',
      light: '#2E9F63',
      dark: '#005A2D',
    },
    error: {
      main: '#C8102E',
    },
    background: {
      default: '#F5F7FA',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Cairo", "Noto Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif',
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
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(15, 38, 64, 0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={appTheme}>
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
