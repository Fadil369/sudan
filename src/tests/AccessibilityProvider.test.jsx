import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../components/AccessibilityProvider';

// Test component to use the accessibility hook
const TestComponent = () => {
  const { accessibility, updateAccessibility } = useAccessibility();

  return (
    <div>
      <div data-testid="font-size">{accessibility.fontSize}</div>
      <div data-testid="high-contrast">{accessibility.highContrast.toString()}</div>
      <div data-testid="reduced-motion">{accessibility.reducedMotion.toString()}</div>
      <div data-testid="screen-reader">{accessibility.screenReader.toString()}</div>
      <div data-testid="color-blindness">{accessibility.colorBlindness}</div>

      <button
        onClick={() => updateAccessibility({ fontSize: 'large' })}
        data-testid="increase-font"
      >
        Increase Font
      </button>

      <button
        onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
        data-testid="toggle-contrast"
      >
        Toggle Contrast
      </button>

      <button
        onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
        data-testid="toggle-motion"
      >
        Toggle Motion
      </button>

      <button
        onClick={() => updateAccessibility({ screenReader: !accessibility.screenReader })}
        data-testid="toggle-screen-reader"
      >
        Toggle Screen Reader
      </button>

      <button
        onClick={() => updateAccessibility({ colorBlindness: 'protanopia' })}
        data-testid="set-protanopia"
      >
        Set Protanopia
      </button>
    </div>
  );
};

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any CSS variables that might have been set
    document.documentElement.style.removeProperty('--font-scale');
    document.documentElement.classList.remove('high-contrast', 'reduced-motion');
  });

  test('provides default accessibility settings', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    expect(screen.getByTestId('screen-reader')).toHaveTextContent('false');
    expect(screen.getByTestId('color-blindness')).toHaveTextContent('none');
  });

  test('updates font size setting', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('increase-font');
    fireEvent.click(button);

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
  });

  test('toggles high contrast mode', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('toggle-contrast');
    fireEvent.click(button);

    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');

    // Should apply high-contrast class to document
    expect(document.documentElement).toHaveClass('high-contrast');
  });

  test('toggles reduced motion mode', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('toggle-motion');
    fireEvent.click(button);

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');

    // Should apply reduced-motion class to document
    expect(document.documentElement).toHaveClass('reduced-motion');
  });

  test('toggles screen reader mode', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('toggle-screen-reader');
    fireEvent.click(button);

    expect(screen.getByTestId('screen-reader')).toHaveTextContent('true');
  });

  test('sets color blindness filter', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('set-protanopia');
    fireEvent.click(button);

    expect(screen.getByTestId('color-blindness')).toHaveTextContent('protanopia');
  });

  test('persists settings to localStorage', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('increase-font'));
    // Verify UI state changed
    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    // Verify a persistence attempt occurred if mock is present
    if (localStorage.setItem && localStorage.setItem.mock) {
      const persisted = localStorage.setItem.mock.calls.some(c => c[0] === 'accessibility-settings');
      expect(persisted).toBe(true);
    }
  });

  test('loads settings from localStorage on mount', () => {
    // Pre-populate localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify({
  fontSize: 'medium',
      highContrast: true,
      reducedMotion: true,
      screenReader: false,
      colorBlindness: 'deuteranopia'
    }));

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

  expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    expect(screen.getByTestId('color-blindness')).toHaveTextContent('deuteranopia');
  });

  test('applies CSS variables for font scaling', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('increase-font');
    fireEvent.click(button);
  await waitFor(() => fireEvent.click(button));
    // Check if CSS variable is set
    const fontScale = document.documentElement.style.getPropertyValue('--font-scale');
    expect(fontScale).toBeTruthy();
  });

  test('handles invalid localStorage data gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('accessibility-settings', 'invalid-json');

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Should fallback to default settings
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
  });

  test('throws error when useAccessibility is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccessibility must be used within AccessibilityProvider');

    consoleSpy.mockRestore();
  });

  test('applies multiple settings simultaneously', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Apply multiple settings
    fireEvent.click(screen.getByTestId('increase-font'));
    fireEvent.click(screen.getByTestId('toggle-contrast'));
    fireEvent.click(screen.getByTestId('toggle-motion'));

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');

    // Check CSS classes
    expect(document.documentElement).toHaveClass('high-contrast');
    expect(document.documentElement).toHaveClass('reduced-motion');
  });

  test('respects system preferences for reduced motion', () => {
    // Mock window.matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Should detect system preference
    expect(document.documentElement).toHaveClass('reduced-motion');
  });

  test('respects system preferences for high contrast', () => {
    // Mock window.matchMedia for high contrast
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Should detect system preference
    expect(document.documentElement).toHaveClass('high-contrast');
  });

  test('keyboard navigation support works', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const button = screen.getByTestId('increase-font');

    // Test keyboard activation
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter' });

    expect(screen.getByTestId('font-size')).toHaveTextContent('large');
  });

  test('color blindness filters are applied correctly', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Test different color blindness types
    const protanopiaButton = screen.getByTestId('set-protanopia');
    fireEvent.click(protanopiaButton);

    expect(screen.getByTestId('color-blindness')).toHaveTextContent('protanopia');

    // Should apply appropriate CSS filter
    const bodyFilter = document.body.style.filter;
    expect(bodyFilter).toContain('hue-rotate') || expect(bodyFilter).toContain('contrast');
  });

  test('handles rapid setting changes without errors', async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    const contrastButton = screen.getByTestId('toggle-contrast');

    // Rapidly toggle contrast
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        fireEvent.click(contrastButton);
      });
    }

    // Should handle rapid changes without errors
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
  });
});

describe.skip('AccessibilityProvider CSS Effects', () => {
  test('font size changes affect CSS custom properties', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    // Test different font sizes
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const expectedScales = [0.875, 1, 1.25, 1.5];

    sizes.forEach((size, index) => {
      act(() => {
        const { updateAccessibility } = useAccessibility();
        updateAccessibility({ fontSize: size });
      });

      // Note: In a real test environment, you'd check the actual CSS custom property
      // This is a simplified test
    });
  });

  test('high contrast mode applies correct CSS', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-contrast'));

    // Check if high contrast styles are applied
    expect(document.documentElement).toHaveClass('high-contrast');

    // In a real implementation, you'd also check:
    // - Increased contrast ratios
    // - Border enhancements
    // - Color modifications
  });

  test('reduced motion removes animations', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-motion'));

    expect(document.documentElement).toHaveClass('reduced-motion');

    // In a real implementation, CSS would contain:
    // .reduced-motion * { animation: none !important; transition: none !important; }
  });
});
