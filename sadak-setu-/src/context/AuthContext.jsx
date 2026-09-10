import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          
          // Optionally verify token with backend
          try {
            const verifiedUser = await authService.me();
            setUser(verifiedUser.data);
          } catch (tokenError) {
            // Token might be expired, clear local auth
            console.warn('Token verification failed:', tokenError);
            await authService.logout();
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await authService.login(email, password);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await authService.me();
      setUser(result.data);
      return result.data;
    } catch (err) {
      console.error('User refresh error:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};