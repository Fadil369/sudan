/**
 * AppNavigator - Main Navigation Structure
 * SGDUS Mobile App
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Service Screens
import HealthScreen from '../screens/services/HealthScreen';
import EducationScreen from '../screens/services/EducationScreen';
import AgricultureScreen from '../screens/services/AgricultureScreen';
import FinanceScreen from '../screens/services/FinanceScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Simple icon component
const TabIcon = ({ name, focused, color }) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, { color }]}>{name}</Text>
  </View>
);

// Auth Stack Navigator
const AuthStack = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
};

// Services Stack
const ServicesStack = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ServicesMain" 
        component={ServicesScreen}
        options={{ title: t('services.title') }}
      />
      <Stack.Screen 
        name="Health" 
        component={HealthScreen}
        options={{ title: t('services.health') }}
      />
      <Stack.Screen 
        name="Education" 
        component={EducationScreen}
        options={{ title: t('services.education') }}
      />
      <Stack.Screen 
        name="Agriculture" 
        component={AgricultureScreen}
        options={{ title: t('services.agriculture') }}
      />
      <Stack.Screen 
        name="Finance" 
        component={FinanceScreen}
        options={{ title: t('services.finance') }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textInverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="🏠" focused={focused} color={color} />
          ),
          headerTitle: 'SGDUS',
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStack}
        options={{
          title: t('nav.services'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="🏛️" focused={focused} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: t('nav.notifications'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="🔔" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="👤" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
});

export default AppNavigator;
