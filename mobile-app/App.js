/**
 * SGDUS Mobile App
 * Sudan Government Digital Unified System
 * 
 * Mobile-first application serving 40+ million Sudanese citizens
 * Supports: Identity verification, government services, health, education,
 * agriculture, finance, and more
 * 
 * OID Root: 1.3.6.1.4.1.61026
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './src/store';
import i18n from './src/utils/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
]);

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <SafeAreaProvider>
            <ThemeProvider>
              <AuthProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor="#ffffff"
                    translucent={false}
                  />
                  <AppNavigator />
                </NavigationContainer>
              </AuthProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
