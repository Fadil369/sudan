/**
 * AuthContext - Authentication Context Provider
 * Handles citizen authentication with OID-based identity
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [oid, setOid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@sgdus_user');
      const storedOid = await AsyncStorage.getItem('@sgdus_oid');
      const token = await AsyncStorage.getItem('@sgdus_token');

      if (storedUser && storedOid && token) {
        setUser(JSON.parse(storedUser));
        setOid(storedOid);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Register new citizen
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/identity/register', userData);
      
      if (response.data.success) {
        const { token, citizen, oid: citizenOid } = response.data;
        
        await AsyncStorage.setItem('@sgdus_user', JSON.stringify(citizen));
        await AsyncStorage.setItem('@sgdus_oid', citizenOid);
        await AsyncStorage.setItem('@sgdus_token', token);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(citizen);
        setOid(citizenOid);
        setIsAuthenticated(true);
        
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with national ID
  const login = useCallback(async (nationalId, password) => {
    try {
      setLoading(true);
      const response = await api.post('/identity/login', { nationalId, password });
      
      if (response.data.success) {
        const { token, citizen, oid: citizenOid } = response.data;
        
        await AsyncStorage.setItem('@sgdus_user', JSON.stringify(citizen));
        await AsyncStorage.setItem('@sgdus_oid', citizenOid);
        await AsyncStorage.setItem('@sgdus_token', token);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(citizen);
        setOid(citizenOid);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Biometric authentication
  const loginWithBiometric = useCallback(async () => {
    try {
      const ReactNativeBiometrics = require('react-native-biometrics');
      const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
      
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Verify your identity',
        cancelButtonText: 'Cancel'
      });
      
      if (success) {
        // Load stored credentials
        const token = await AsyncStorage.getItem('@sgdus_token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await loadStoredAuth();
          return { success: true };
        }
      }
      return { success: false, error: 'Biometric verification failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['@sgdus_user', '@sgdus_oid', '@sgdus_token']);
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setOid(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Verify identity
  const verifyIdentity = useCallback(async (otp) => {
    try {
      const response = await api.post('/identity/verify', { oid, otp });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [oid]);

  const value = {
    user,
    oid,
    loading,
    isAuthenticated,
    register,
    login,
    loginWithBiometric,
    logout,
    verifyIdentity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
