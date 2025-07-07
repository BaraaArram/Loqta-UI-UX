import axios, { AxiosError, AxiosResponse } from 'axios';
import { config } from '../config/env';

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference to auth context functions
let authContext: {
  token: string | null;
  refreshTokenFn: () => Promise<void>;
  logout: () => Promise<void>;
} | null = null;

// Function to set auth context reference
export const setAuthContext = (context: {
  token: string | null;
  refreshTokenFn: () => Promise<void>;
  logout: () => Promise<void>;
}) => {
  authContext = context;
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Use authContext token first, then fall back to localStorage
    const accessToken = authContext?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn(`No access token available for request to ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using auth context
        if (authContext?.refreshTokenFn) {
          await authContext.refreshTokenFn();
          
          // Get the new access token
          const newAccessToken = authContext?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
          if (newAccessToken) {
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        if (authContext?.logout) {
          await authContext.logout();
        }
        return Promise.reject(refreshError);
      }
    }

    // Transform error messages for better UX
    let errorMessage = 'An unexpected error occurred';
    const status: number = error.response?.status || 0;
    const data = error.response?.data as any;

    if (status === 400) {
      errorMessage = 'Invalid request. Please check your input.';
    } else if (status === 401) {
      errorMessage = 'Please log in to continue';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (status === 422) {
      errorMessage = 'Please check your input and try again';
    } else if (status >= 500) {
      errorMessage = 'Server error. Please try again later';
    } else if (data?.detail) {
      errorMessage = data.detail;
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (typeof data === 'object' && Object.keys(data).length > 0) {
      // Handle validation errors
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        errorMessage = firstError[0] as string;
      } else if (typeof firstError === 'string') {
        errorMessage = firstError;
      }
    }

    // Create a more detailed error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      originalData: data,
      status: status,
    };

    return Promise.reject(enhancedError);
  }
);

export default api; 