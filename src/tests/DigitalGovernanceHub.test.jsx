import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DigitalGovernanceHub from '../components/DigitalGovernanceHub';

const theme = createTheme();

function renderHub(language = 'ar') {
  return render(
    <ThemeProvider theme={theme}>
      <DigitalGovernanceHub language={language} />
    </ThemeProvider>
  );
}

describe('DigitalGovernanceHub', () => {
  test('renders in Arabic (RTL) by default and toggles to English (LTR)', () => {
    renderHub('ar');

    const container = screen.getByTestId('digital-governance-hub');
    expect(container).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText(/مركز الحكومة الرقمية العملية/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('governance-lang-toggle'));
    expect(container).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText(/Practical Digital Government Hub/)).toBeInTheDocument();
  });

  test('displays STA Fiscal Transparency and runs Federal Equalization Calculator', () => {
    renderHub('en');

    expect(screen.getByTestId('panel-treasury')).toBeInTheDocument();
    expect(screen.getByText(/Federal Fiscal Equalization Calculator/)).toBeInTheDocument();

    const calcBtn = screen.getByTestId('calculate-equalization-btn');
    fireEvent.click(calcBtn);
    expect(screen.getByText(/Federal 45%/)).toBeInTheDocument();
    expect(screen.getByText(/States 50%/)).toBeInTheDocument();
    expect(screen.getByText(/Reserve 5%/)).toBeInTheDocument();
  });

  test('switches through OCDS Procurement, Land & Hawakeer Shield, and Citizen Consent Wallet tabs', async () => {
    renderHub('en');

    // Tab 1: Procurement
    fireEvent.click(screen.getByTestId('tab-procurement'));
    expect(screen.getByTestId('panel-procurement')).toBeInTheDocument();
    expect(screen.getByText('ocds-sd-2026-0001')).toBeInTheDocument();

    // Tab 2: Land & Hawakeer
    fireEvent.click(screen.getByTestId('tab-land'));
    expect(screen.getByTestId('panel-land')).toBeInTheDocument();
    expect(screen.getByText(/Hawakeer Communal/)).toBeInTheDocument();
    expect(screen.getAllByText(/Frozen \(409 Dispute Shield\)/).length).toBeGreaterThan(0);

    // Tab 3: Citizen Consent Wallet + one-click revoke
    fireEvent.click(screen.getByTestId('tab-consent'));
    expect(screen.getByTestId('panel-consent')).toBeInTheDocument();
    const revokeBtn = screen.getByTestId('revoke-consent-CR-2026-HEALTH-001');
    expect(revokeBtn).not.toBeDisabled();

    fireEvent.click(revokeBtn);
    await waitFor(() => {
      expect(revokeBtn).toBeDisabled();
      expect(screen.getByText(/revoked immediately/i)).toBeInTheDocument();
    });
  });
});
