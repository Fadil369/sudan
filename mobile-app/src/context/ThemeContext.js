/**
 * ThemeContext - Theme Provider
 * Supports Light/Dark mode with Sudan government branding
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Sudan Government Color Palette
export const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#0ea5e9',      // Trust blue
    primaryDark: '#0284c7',
    primaryLight: '#38bdf8',
    
    secondary: '#6366f1',    // Government purple
    secondaryDark: '#4f46e5',
    secondaryLight: '#818cf8',
    
    // National colors
    sudanRed: '#dc2626',
    sudanWhite: '#ffffff',
    sudanBlack: '#000000',
    sudanBlue: '#1e40af',
    
    // Semantic colors
    success: '#00e676',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Backgrounds
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    
    // Text
    text: '#0f172a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // Borders
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Status
    online: '#22c55e',
    offline: '#94a3b8',
    busy: '#f59e0b',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: 'normal', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
  },
  
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  },
};

export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    
    // Dark mode overrides
    primary: '#38bdf8',
    primaryDark: '#0ea5e9',
    primaryLight: '#7dd3fc',
    
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    
    border: '#334155',
    borderLight: '#1e293b',
  },
};

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeName, setThemeName] = useState('system');

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@sgdus_theme');
      if (savedTheme) {
        setThemeName(savedTheme);
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use system preference as default
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setThemeName(newTheme);
    await AsyncStorage.setItem('@sgdus_theme', newTheme);
  };

  const setTheme = async (theme) => {
    setThemeName(theme);
    setIsDarkMode(theme === 'dark');
    await AsyncStorage.setItem('@sgdus_theme', theme);
  };

  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  const value = {
    theme,
    isDarkMode,
    themeName,
    toggleTheme,
    setTheme,
    colors: theme.colors,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
    shadows: theme.shadows,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
