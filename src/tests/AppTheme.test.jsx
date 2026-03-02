import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, Typography, useTheme } from '@mui/material';
import { appTheme } from '../App';

describe('appTheme government design tokens', () => {
  test('uses government primary palette and typography family', () => {
    expect(appTheme.palette.primary.main).toBe('#1B3A5C');
    expect(appTheme.palette.secondary.main).toBe('#007A3D');
    expect(appTheme.palette.error.main).toBe('#C8102E');
    expect(appTheme.palette.background.default).toBe('#F5F7FA');
    expect(appTheme.typography.fontFamily).toContain('Inter');
    expect(appTheme.typography.fontFamily).toContain('Cairo');
  });

  test('provides theme tokens through ThemeProvider', () => {
    const ThemeProbe = () => {
      const theme = useTheme();
      return <Typography>{theme.palette.primary.main}</Typography>;
    };

    render(
      <ThemeProvider theme={appTheme}>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByText('#1B3A5C')).toBeInTheDocument();
  });
});
