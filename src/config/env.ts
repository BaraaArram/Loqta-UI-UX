// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'Loqta',
    description: 'Loqta e-commerce',
    version: '1.0.0',
  },
  
  // Authentication Configuration
  auth: {
    tokenKey: 'token',
    refreshTokenKey: 'refreshToken',
    userKey: 'user',
  },
  
  // Development Configuration
  development: {
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
} as const;

// Type-safe environment variables
export type Config = typeof config; 