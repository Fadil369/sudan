import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../security/AuthService';

/**
 * Secure Authentication Provider with RBAC
 * Manages authentication state and provides security context
 */

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
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh tokens before expiry
  useEffect(() => {
    if (tokens && sessionExpiry) {
      const refreshTime = sessionExpiry - Date.now() - 60000; // 1 minute before expiry
      if (refreshTime > 0) {
        const timeout = setTimeout(() => {
          refreshTokens();
        }, refreshTime);

        return () => clearTimeout(timeout);
      }
    }
  }, [tokens, sessionExpiry]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Initialize authentication state from stored tokens
   */
  const initializeAuth = useCallback(async () => {
    try {
      const storedTokens = getStoredTokens();
      if (!storedTokens) {
        setLoading(false);
        return;
      }

      // Verify stored access token
      try {
        const payload = AuthService.verifyToken(storedTokens.accessToken);
        
        // Reconstruct user object from token
        const userData = {
          id: payload.userId,
          username: payload.username,
          role: payload.role,
          permissions: payload.permissions,
          ministryId: payload.ministryId
        };

        setUser(userData);
        setTokens(storedTokens);
        setSessionExpiry(payload.exp * 1000);
        
      } catch (tokenError) {
        // Token invalid, try refresh
        if (storedTokens.refreshToken) {
          await refreshTokens(storedTokens.refreshToken);
        } else {
          clearAuthState();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Secure login function
   */
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      
      const result = await AuthService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setTokens(result.tokens);
        
        // Calculate session expiry
        const payload = AuthService.verifyToken(result.tokens.accessToken);
        setSessionExpiry(payload.exp * 1000);
        
        // Store tokens securely
        storeTokens(result.tokens);
        
        return { success: true, user: result.user };
      }
      
      throw new Error('Login failed');
      
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Secure logout function
   */
  const logout = useCallback(async () => {
    try {
      if (tokens) {
        await AuthService.logout(tokens);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
    }
  }, [tokens]);

  /**
   * Refresh authentication tokens
   */
  const refreshTokens = useCallback(async (refreshToken = null) => {
    try {
      const tokenToUse = refreshToken || tokens?.refreshToken;
      if (!tokenToUse) {
        throw new Error('No refresh token available');
      }

      const result = await AuthService.refreshTokens(tokenToUse);
      
      if (result.success) {
        setTokens(result.tokens);
        
        // Update session expiry
        const payload = AuthService.verifyToken(result.tokens.accessToken);
        setSessionExpiry(payload.exp * 1000);
        
        // Update stored tokens
        storeTokens(result.tokens);
        
        return true;
      }
      
      throw new Error('Token refresh failed');
      
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthState();
      return false;
    }
  }, [tokens]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) {
      return false;
    }
    return AuthService.hasPermission(user.permissions, permission);
  }, [user]);

  /**
   * Check if user has required role level
   */
  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) {
      return false;
    }
    return AuthService.hasRoleLevel(user.role, requiredRole);
  }, [user]);

  /**
   * Check if user can access ministry data
   */
  const canAccessMinistry = useCallback((ministryId) => {
    if (!user) {
      return false;
    }
    
    // Super admin can access all ministries
    if (hasPermission('*')) {
      return true;
    }
    
    // Ministry admin can access their own ministry
    if (user.role === 'ministry_admin' && user.ministryId === ministryId) {
      return true;
    }
    
    // Department head can access their ministry
    if (user.role === 'department_head' && user.ministryId === ministryId) {
      return true;
    }
    
    return false;
  }, [user, hasPermission]);

  /**
   * Get current session info
   */
  const getSessionInfo = useCallback(() => {
    if (!tokens || !sessionExpiry) {
      return null;
    }
    
    const now = Date.now();
    const timeUntilExpiry = sessionExpiry - now;
    
    return {
      isExpired: timeUntilExpiry <= 0,
      expiresIn: Math.max(0, Math.floor(timeUntilExpiry / 1000)),
      expiresAt: new Date(sessionExpiry).toISOString(),
      autoRefreshIn: Math.max(0, Math.floor((timeUntilExpiry - 60000) / 1000))
    };
  }, [tokens, sessionExpiry]);

  /**
   * Store tokens securely
   */
  const storeTokens = (tokenData) => {
    try {
      // In production, use httpOnly cookies or secure storage
      const secureTokenData = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('auth_tokens', JSON.stringify(secureTokenData));
    } catch (error) {
      console.error('Token storage failed:', error);
    }
  };

  /**
   * Get stored tokens
   */
  const getStoredTokens = () => {
    try {
      const stored = sessionStorage.getItem('auth_tokens');
      if (!stored) {
        return null;
      }
      
      const tokenData = JSON.parse(stored);
      
      // Check if tokens are too old (security measure)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - tokenData.timestamp > maxAge) {
        sessionStorage.removeItem('auth_tokens');
        return null;
      }
      
      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken
      };
    } catch (error) {
      console.error('Token retrieval failed:', error);
      return null;
    }
  };

  /**
   * Clear authentication state
   */
  const clearAuthState = () => {
    setUser(null);
    setTokens(null);
    setSessionExpiry(null);
    sessionStorage.removeItem('auth_tokens');
  };

  /**
   * Get authorization header for API calls
   */
  const getAuthHeader = useCallback(() => {
    if (tokens?.accessToken) {
      return {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      };
    }
    return {};
  }, [tokens]);

  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated: !!user,
    tokens,
    
    // Actions
    login,
    logout,
    refreshTokens,
    
    // Permission checks
    hasPermission,
    hasRole,
    canAccessMinistry,
    
    // Session management
    getSessionInfo,
    getAuthHeader,
    
    // User info helpers
    isAdmin: user?.role === 'super_admin',
    isMinistryAdmin: user?.role === 'ministry_admin',
    isOfficial: ['super_admin', 'ministry_admin', 'department_head', 'official'].includes(user?.role),
    isCitizen: ['citizen', 'verified_citizen'].includes(user?.role)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;