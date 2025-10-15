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
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '4h',
  
  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Jobs
  jobSchedule: {
    dailyMetrics: process.env.DAILY_METRICS_CRON || '0 2 * * *', // 2h da manhã
    healthCheck: process.env.HEALTH_CHECK_CRON || '*/5 * * * *', // A cada 5 minutos
  },

  // Health Check
  healthCheck: {
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10), // 5 segundos
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES || '3', 10),
    alertThreshold: parseInt(process.env.HEALTH_CHECK_ALERT_THRESHOLD || '3', 10), // Falhas consecutivas para alertar
  },

  // Legacy Systems (para integração)
  legacySystems: {
    salesApiUrl: process.env.LEGACY_SALES_API_URL || 'http://localhost:8080/api/sales',
    inventoryApiUrl: process.env.LEGACY_INVENTORY_API_URL || 'http://localhost:8081/api/inventory',
    timeout: parseInt(process.env.LEGACY_API_TIMEOUT || '10000', 10), // 10 segundos
  },

  // Cache fallback
  cacheFallbackTTL: parseInt(process.env.CACHE_FALLBACK_TTL || '86400', 10), // 24 horas

  // Validation
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
