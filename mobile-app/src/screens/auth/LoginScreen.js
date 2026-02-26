/**
 * LoginScreen - Citizen Login
 * SGDUS Mobile App
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, loginWithBiometric } = useAuth();
  const { colors, spacing, borderRadius } = useTheme();
  
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nationalId || !password) {
      Alert.alert(t('common.error'), t('errors.required'));
      return;
    }

    setLoading(true);
    const result = await login(nationalId, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert(t('common.error'), result.error || t('errors.invalidCredentials'));
    }
  };

  const handleBiometricLogin = async () => {
    const result = await loginWithBiometric();
    if (!result.success) {
      Alert.alert(t('common.error'), result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🇸🇩</Text>
            <Text style={[styles.title, { color: colors.text }]}>
              SGDUS
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sudan Government Digital Unified System
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('auth.nationalId')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={nationalId}
              onChangeText={setNationalId}
              placeholder="1234567890"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              {t('auth.password')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary, borderRadius: borderRadius.md },
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? t('common.loading') : t('auth.login')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.biometricIcon}>👆</Text>
              <Text style={[styles.biometricText, { color: colors.text }]}>
                {t('auth.biometricLogin')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                {t('auth.createAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loginButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 16,
  },
  biometricIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  biometricText: {
    fontSize: 14,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
});

export default LoginScreen;
