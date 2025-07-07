'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { config } from '@/config/env';
import { setAuthContext } from '../lib/axios';

// Minimal types and API logic for authentication

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  profile_pic?: string | null;
  is_staff?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

const API_BASE = typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000' : 'http://localhost:8000';

const authAPI = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const res = await fetch(`${API_BASE}/auth/token/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    // Extract tokens from nested response structure
    const { data: tokenData } = data;
    return {
      access: tokenData.data.access,
      refresh: tokenData.data.refresh,
    };
  },
  register: async (userData: RegisterData): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
  logout: async (refreshToken: string): Promise<void> => {
    await fetch(`${API_BASE}/auth/token/destroy/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    const { data: tokenData } = data;
    return {
      access: tokenData.data.access,
      refresh: tokenData.data.refresh,
    };
  },
  getProfile: async (accessToken: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/profile/`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
  verifyToken: async (token: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/token/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'TOKEN_REFRESH_SUCCESS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
        hydrated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        hydrated: true,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        hydrated: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'TOKEN_REFRESH_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
        hydrated: true,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  inactiveUser: string | null;
  hydrated: boolean;
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  refreshTokenFn: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  verifyToken: (token: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [inactiveUser, setInactiveUser] = useState<string | null>(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const checkAndSetAuth = async () => {
      const accessToken = localStorage.getItem(config.auth.tokenKey);
      const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
      const userData = localStorage.getItem(config.auth.userKey);

      if (accessToken && refreshToken && userData) {
        try {
          // Try to verify the access token
          await authAPI.verifyToken(accessToken);
          // If valid, set auth state
          const user = JSON.parse(userData);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, accessToken, refreshToken },
          });
        } catch (verifyError) {
          // If token is invalid, try to refresh
          try {
            const tokenResponse = await authAPI.refreshToken(refreshToken);
            localStorage.setItem(config.auth.tokenKey, tokenResponse.access);
            localStorage.setItem(config.auth.refreshTokenKey, tokenResponse.refresh);
            const user = JSON.parse(userData);
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, accessToken: tokenResponse.access, refreshToken: tokenResponse.refresh },
            });
          } catch (refreshError) {
            // If refresh fails, clear everything and logout
            localStorage.removeItem(config.auth.tokenKey);
            localStorage.removeItem(config.auth.refreshTokenKey);
            localStorage.removeItem(config.auth.userKey);
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        }
      } else {
        // If no tokens, set hydrated to true by dispatching AUTH_LOGOUT
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };
    checkAndSetAuth();
  }, []);

  // Save tokens to localStorage when they change
  useEffect(() => {
    if (state.accessToken) {
      localStorage.setItem(config.auth.tokenKey, state.accessToken);
    } else {
      localStorage.removeItem(config.auth.tokenKey);
    }

    if (state.refreshToken) {
      localStorage.setItem(config.auth.refreshTokenKey, state.refreshToken);
    } else {
      localStorage.removeItem(config.auth.refreshTokenKey);
    }

    if (state.user) {
      localStorage.setItem(config.auth.userKey, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(config.auth.userKey);
    }
  }, [state.accessToken, state.refreshToken, state.user]);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    setInactiveUser(null);
    try {
      const tokenResponse: TokenResponse = await authAPI.login(credentials);
      localStorage.setItem(config.auth.tokenKey, tokenResponse.access);
      localStorage.setItem(config.auth.refreshTokenKey, tokenResponse.refresh);
      let user: User;
      try {
        user = await authAPI.getProfile(tokenResponse.access);
      } catch (profileError: any) {
        user = {
          id: 'temp-id',
          email: credentials.email,
          username: credentials.email.split('@')[0],
          first_name: '',
          last_name: '',
          phone_number: '',
          is_active: true,
          date_joined: new Date().toISOString(),
        };
      }
      if (!user.is_active) {
        setInactiveUser(user.email);
        await logout();
        dispatch({ type: 'AUTH_FAILURE', payload: 'Your account is not active. Please check your email for an activation link.' });
        throw new Error('Account not active');
      }
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          accessToken: tokenResponse.access,
          refreshToken: tokenResponse.refresh,
        },
      });
    } catch (error: any) {
      let errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Login failed';
      if (
        errorMessage.toLowerCase().includes('not active') ||
        errorMessage.toLowerCase().includes('inactive') ||
        errorMessage.toLowerCase().includes('activate')
      ) {
        errorMessage = 'Your account is not active. Please check your email for an activation link.';
      }
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    setInactiveUser(null);
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error: any) {
      let errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Registration failed';
      if (
        errorMessage.toLowerCase().includes('not active') ||
        errorMessage.toLowerCase().includes('inactive') ||
        errorMessage.toLowerCase().includes('activate')
      ) {
        errorMessage = 'Your account is not active. Please check your email for an activation link.';
      }
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.refreshToken) {
        await authAPI.logout(state.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all tokens and user data from localStorage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      localStorage.removeItem(config.auth.userKey);
      dispatch({ type: 'AUTH_LOGOUT' });
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const refreshTokenFn = async () => {
    if (!state.refreshToken) {
      throw new Error('No refresh token available');
    }

    dispatch({ type: 'AUTH_START' });
    try {
      const response: TokenResponse = await authAPI.refreshToken(state.refreshToken);
      dispatch({
        type: 'TOKEN_REFRESH_SUCCESS',
        payload: {
          accessToken: response.access,
          refreshToken: response.refresh,
        },
      });
    } catch (error: any) {
      // If refresh fails, logout the user
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  // Add a function to refresh user data
  const refreshUserData = async () => {
    if (!state.accessToken) {
      return;
    }

    try {
      const user = await authAPI.getProfile(state.accessToken);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
    }
  };

  // Set auth context after state is set and whenever accessToken changes
  useEffect(() => {
    setAuthContext({
      token: state.accessToken,
      refreshTokenFn,
      logout,
    });
  }, [state.accessToken, refreshTokenFn, logout]);

  const verifyToken = async (token: string): Promise<any> => {
    return authAPI.verifyToken(token);
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshTokenFn,
    refreshUserData,
    clearError,
    setUser,
    inactiveUser,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 