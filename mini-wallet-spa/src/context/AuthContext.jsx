import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletApi } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check initial session
  useEffect(() => {
    async function initAuth() {
      try {
        const token = walletApi.getAuthToken();
        const savedAuth = sessionStorage.getItem('mini_wallet_auth');
        if (token || savedAuth) {
          const profile = await walletApi.getProfile();
          if (profile) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        walletApi.setAuthToken(null);
        sessionStorage.removeItem('mini_wallet_auth');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    }

    initAuth();
  }, []);

  const register = async (username, email, password, phone) => {
    setAuthError(null);
    try {
      return await walletApi.register(username, email, password, phone);
    } catch (err) {
      setAuthError(err.message || 'Register gagal.');
      throw err;
    }
  };

  const login = async (identifier, password) => {
    setAuthError(null);
    try {
      const loggedUser = await walletApi.login(identifier, password);
      setUser(loggedUser);
      setIsAuthenticated(true);
      sessionStorage.setItem('mini_wallet_auth', 'true');
      return loggedUser;
    } catch (err) {
      setAuthError(err.message || 'Login gagal.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await walletApi.logout();
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem('mini_wallet_auth');
    }
  };

  const updateBalance = (newBalance) => {
    setUser((prev) => (prev ? { ...prev, balance: newBalance } : prev));
  };

  const refreshProfile = async () => {
    try {
      const profile = await walletApi.getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitializing,
        authError,
        register,
        login,
        logout,
        updateBalance,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
