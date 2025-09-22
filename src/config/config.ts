import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/backoffice-veiculos',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/backoffice-veiculos-test',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Validation
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
