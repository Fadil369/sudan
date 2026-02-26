import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import OIDIntegration from '../components/OIDIntegration';

// Mock the AccessibilityProvider
jest.mock('../components/AccessibilityProvider', () => ({
  useAccessibility: () => ({
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindness: 'none'
    }
  })
}));

const TestWrapper = ({ children, language = 'en' }) => {
  const theme = createTheme({
    direction: language === 'ar' ? 'rtl' : 'ltr',
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

describe.skip('OIDIntegration Component', () => {
  const mockUser = {
    id: 'test-user-123',
    name: 'Ahmed Mohamed Ali',
    oidNumber: '1.3.6.1.4.1.61026.2.01.001.234567890.1',
    nationalId: '199501234567890'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock crypto.subtle for biometric simulation
    Object.defineProperty(window, 'crypto', {
      value: {
        subtle: {
          generateKey: jest.fn().mockResolvedValue({}),
          sign: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
          verify: jest.fn().mockResolvedValue(true)
        }
      }
    });
  });

  test('renders OID integration interface correctly', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Sudan Digital Identity System')).toBeInTheDocument();
    expect(screen.getByText('OID-Based Citizen Profile')).toBeInTheDocument();
  });

  test('displays user OID number correctly', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText(mockUser.oidNumber)).toBeInTheDocument();
  });

  test('renders biometric authentication options', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Biometric Authentication')).toBeInTheDocument();
    expect(screen.getByText('Fingerprint Scan')).toBeInTheDocument();
    expect(screen.getByText('Facial Recognition')).toBeInTheDocument();
    expect(screen.getByText('Iris Scan')).toBeInTheDocument();
    expect(screen.getByText('Voice Recognition')).toBeInTheDocument();
  });

  test('fingerprint authentication works', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const fingerprintButton = screen.getByText('Fingerprint Scan').closest('button');
    expect(fingerprintButton).toBeInTheDocument();

    if (fingerprintButton) {
      fireEvent.click(fingerprintButton);

      await waitFor(() => {
        expect(screen.getByText(/scanning/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Wait for authentication completion
      await waitFor(() => {
        expect(screen.getByText(/verified/i) || screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    }
  });

  test('QR code generation works', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const generateQRButton = screen.getByText('Generate QR Code').closest('button');
    if (generateQRButton) {
      fireEvent.click(generateQRButton);

      await waitFor(() => {
        const qrCodeElement = screen.getByTestId('qr-code') || screen.getByText(/QR.*Code/i);
        expect(qrCodeElement).toBeInTheDocument();
      });
    }
  });

  test('digital certificate display works', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Digital Certificate')).toBeInTheDocument();
    expect(screen.getByText(/X\.509/i)).toBeInTheDocument();
  });

  test('document management section renders', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Document Management')).toBeInTheDocument();
    expect(screen.getByText('National ID')).toBeInTheDocument();
    expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
    expect(screen.getByText('Passport')).toBeInTheDocument();
  });

  test('service permissions management works', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('Service Permissions')).toBeInTheDocument();

    const permissionSwitches = screen.getAllByRole('checkbox');
    expect(permissionSwitches.length).toBeGreaterThan(0);

    // Test toggling a permission
    fireEvent.click(permissionSwitches[0]);
  });

  test('verification status updates correctly', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const verifyButton = screen.getByText('Verify Identity').closest('button');
    if (verifyButton) {
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/verifying/i) || screen.getByText(/processing/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/verified/i) || screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    }
  });

  test('Arabic language support works', () => {
    render(
      <TestWrapper language="ar">
        <OIDIntegration language="ar" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText('نظام الهوية الرقمية السوداني')).toBeInTheDocument();
    expect(screen.getByText('الملف الشخصي للمواطن')).toBeInTheDocument();
  });

  test('handles missing user data gracefully', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={null} />
      </TestWrapper>
    );

    expect(screen.getByText('Sudan Digital Identity System')).toBeInTheDocument();
    // Should show registration prompt or guest mode
    expect(screen.getByText(/register/i) || screen.getByText(/sign.*in/i) || screen.getByText(/guest/i)).toBeInTheDocument();
  });

  test('biometric enrollment process works', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const enrollButton = screen.getByText('Enroll Biometrics').closest('button');
    if (enrollButton) {
      fireEvent.click(enrollButton);

      await waitFor(() => {
        expect(screen.getByText(/enrollment/i) || screen.getByText(/register.*biometric/i)).toBeInTheDocument();
      });
    }
  });

  test('document download functionality', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const downloadButtons = screen.getAllByText(/download/i);
    expect(downloadButtons.length).toBeGreaterThan(0);

    if (downloadButtons[0]) {
      fireEvent.click(downloadButtons[0]);

      await waitFor(() => {
        // Should show download progress or success
        expect(screen.getByText(/downloading/i) || screen.getByText(/downloaded/i)).toBeInTheDocument();
      });
    }
  });

  test('security features are properly displayed', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    expect(screen.getByText(/AES.*256/i) || screen.getByText(/encryption/i)).toBeInTheDocument();
    expect(screen.getByText(/SHA.*256/i) || screen.getByText(/hash/i)).toBeInTheDocument();
  });

  test('handles network errors gracefully', async () => {
    // Mock fetch to simulate network error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const verifyButton = screen.getByText('Verify Identity').closest('button');
    if (verifyButton) {
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    }
  });

  test('accessibility features work correctly', () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    // Check for proper ARIA labels
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });

    // Check for keyboard navigation support
    const focusableElements = screen.getAllByRole('button');
    focusableElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabIndex', '-1');
    });
  });

  test('real-time verification updates', async () => {
    render(
      <TestWrapper>
        <OIDIntegration language="en" user={mockUser} />
      </TestWrapper>
    );

    const realTimeButton = screen.getByText('Real-time Verification').closest('button');
    if (realTimeButton) {
      fireEvent.click(realTimeButton);

      await waitFor(() => {
        expect(screen.getByText(/connecting/i) || screen.getByText(/live/i)).toBeInTheDocument();
      });
    }
  });
});

describe.skip('OIDIntegration Integration Tests', () => {
  test('integrates with external OID service', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'verified',
        oidNumber: '1.3.6.1.4.1.61026.2.01.001.234567890.1'
      })
    });

    render(
      <TestWrapper>
        <OIDIntegration language="en" user={{ oidNumber: '1.3.6.1.4.1.61026.2.01.001.234567890.1' }} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Sudan Digital Identity System')).toBeInTheDocument();
    });
  });

  test('handles biometric service integration', async () => {
    // Mock biometric service response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        biometricStatus: 'enrolled',
        confidence: 99.8
      })
    });

    render(
      <TestWrapper>
        <OIDIntegration language="en" user={{ oidNumber: '1.3.6.1.4.1.61026.2.01.001.234567890.1' }} />
      </TestWrapper>
    );

    const biometricButton = screen.getByText('Fingerprint Scan').closest('button');
    if (biometricButton) {
      fireEvent.click(biometricButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/biometric'),
          expect.any(Object)
        );
      });
    }
  });
});
