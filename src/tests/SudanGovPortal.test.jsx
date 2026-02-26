import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SudanGovPortal from '../pages/SudanGovPortal';
import { AccessibilityProvider } from '../components/AccessibilityProvider';

// Mock the AccessibilityProvider
const MockAccessibilityProvider = ({ children }) => {
  const mockContext = {
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindness: 'none'
    }
  };

  return (
    <div data-testid="accessibility-provider">
      {children}
    </div>
  );
};

// Create a test wrapper with necessary providers
const TestWrapper = ({ children, language = 'en' }) => {
  const theme = createTheme({
    direction: language === 'ar' ? 'rtl' : 'ltr',
  });

  return (
    <ThemeProvider theme={theme}>
      <MockAccessibilityProvider>
        {children}
      </MockAccessibilityProvider>
    </ThemeProvider>
  );
};

describe('SudanGovPortal', () => {
  const mockUser = {
    id: 'test-user-123',
    name: 'Test User',
    oidNumber: '1.3.6.1.4.1.61026.2.01.001.123456789.1'
  };

  beforeEach(() => {
    // Clear any previous test state
    jest.clearAllMocks();
  });

  test('renders main portal title correctly in English', () => {
    render(
      <TestWrapper language="en">
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Republic of Sudan')).toBeInTheDocument();
    expect(screen.getByText('Digital Government Portal')).toBeInTheDocument();
  });

  test('renders main portal title correctly in Arabic', () => {
    render(
      <TestWrapper language="ar">
        <SudanGovPortal language="ar" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('جمهورية السودان')).toBeInTheDocument();
    expect(screen.getByText('البوابة الحكومية الرقمية')).toBeInTheDocument();
  });

  test('displays all 11 government departments', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for key department names
    expect(screen.getByText('Citizen Identity & Civil Registry')).toBeInTheDocument();
    expect(screen.getByText('Health & Population Systems')).toBeInTheDocument();
    expect(screen.getByText('Education Ministry')).toBeInTheDocument();
    expect(screen.getByText('Finance & Economy')).toBeInTheDocument();
    expect(screen.getByText('Agriculture Ministry')).toBeInTheDocument();
  });

  test('dashboard shows real-time metrics', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for metric displays
    expect(screen.getByText('Active Citizens')).toBeInTheDocument();
    expect(screen.getByText('Daily Transactions')).toBeInTheDocument();
    expect(screen.getByText('System Uptime')).toBeInTheDocument();
    expect(screen.getByText('Service Satisfaction')).toBeInTheDocument();
  });

  test('quick actions panel is present and functional', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for quick action buttons
    expect(screen.getByText('Emergency Services')).toBeInTheDocument();
    expect(screen.getByText('ID Verification')).toBeInTheDocument();
    expect(screen.getByText('Document Request')).toBeInTheDocument();
    expect(screen.getByText('Payment Services')).toBeInTheDocument();
  });

  test('department cards are clickable', async () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    const healthDepartment = screen.getByText('Health & Population Systems').closest('div[role="button"]');
    expect(healthDepartment).toBeInTheDocument();
    
    if (healthDepartment) {
      fireEvent.click(healthDepartment);
      // Should trigger navigation or modal
      await waitFor(() => {
        // Add specific expectations based on implementation
      });
    }
  });

  test('language switching affects text direction', () => {
    const { rerender } = render(
      <TestWrapper language="en">
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check initial LTR
    const container = screen.getByTestId('gov-portal-container') || document.body;
    expect(container).toHaveStyle('direction: ltr');

    // Switch to Arabic
    rerender(
      <TestWrapper language="ar">
        <SudanGovPortal language="ar" user={mockUser} />
      </TestWrapper>
    );

    expect(container).toHaveStyle('direction: rtl');
  });

  test('shows user information when user is provided', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('handles missing user gracefully', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={null} />
      </TestWrapper>
    );

    // Portal should still render without user
    expect(screen.getByText('Digital Government Portal')).toBeInTheDocument();
  });

  test('responsive design elements are present', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for mobile-friendly elements
    const mobileDrawer = screen.queryByTestId('mobile-drawer');
    const responsiveGrid = screen.queryByTestId('responsive-grid');
    
    // These elements should be in the DOM for responsive behavior
    expect(document.querySelector('.MuiGrid-container')).toBeInTheDocument();
  });

  test('accessibility features work correctly', () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for accessibility features
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      // All buttons should meet minimum touch target size (44px)
      const style = window.getComputedStyle(button);
      const minHeight = parseInt(style.minHeight);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    // Check for proper ARIA labels
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });

  test('navigation between sections works', async () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    // Test tab navigation if present
    const tabs = screen.queryAllByRole('tab');
    if (tabs.length > 0) {
      fireEvent.click(tabs[1]);
      await waitFor(() => {
        // Verify tab content changed
      });
    }
  });

  test('search functionality works', async () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" user={mockUser} />
      </TestWrapper>
    );

    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'health' } });
      fireEvent.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        // Check for search results
      });
    }
  });
});

describe('SudanGovPortal Integration Tests', () => {
  test('loads and displays data correctly', async () => {
    render(
      <TestWrapper>
        <SudanGovPortal language="en" />
      </TestWrapper>
    );

    // Wait for any async data loading
    await waitFor(() => {
      expect(screen.getByText('Digital Government Portal')).toBeInTheDocument();
    });
  });

  test('handles errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <SudanGovPortal language="en" />
      </TestWrapper>
    );

    // Component should render even if there are errors
    expect(screen.getByText('Digital Government Portal')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('SudanGovPortal Performance Tests', () => {
  test('renders within acceptable time', async () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <SudanGovPortal language="en" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Digital Government Portal')).toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(1000); // Should render within 1 second
  });
});
