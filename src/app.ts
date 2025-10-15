import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/config/config';
import { swaggerSpec } from '@/config/swagger';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { LoggingMiddleware } from '@/middleware/logger.middleware';
import { MetricsMiddleware } from '@/middleware/metrics.middleware';
import { HealthCheckMiddleware } from '@/middleware/healthCheck.middleware';
import { logger } from '@/utils/logger';

// Import routes
import vehicleRoutes from '@/routes/vehicleRoutes';
import userRoutes from '@/routes/userRoutes';
import salesRoutes from '@/routes/salesRoutes';
import metricsRoutes from '@/routes/metrics.routes';
import healthRoutes from '@/routes/health.routes';

const app = express();

// Configure encoding
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  type: 'application/x-www-form-urlencoded'
}));

// Set charset for responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});


// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Structured logging middleware
app.use(LoggingMiddleware.create({
  logRequests: true,
  logResponses: true,
  logErrors: true,
  logPerformance: true
}));

// Metrics middleware
app.use(MetricsMiddleware.create({
  enabled: true,
  alertThresholds: {
    responseTime: 2000,
    errorRate: 5.0
  },
  collectUserMetrics: true
}));

// Health check middleware
app.use(HealthCheckMiddleware.create({
  enabled: true,
  timeout: 5000,
  alertOnFailure: true
}));

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Backoffice Veículos API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

// Health check routes
app.use('/health', healthRoutes);

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    success: true,
    jwtExpiresIn: config.jwtExpiresIn,
    jwtSecret: config.jwtSecret ? 'SET' : 'NOT SET',
    nodeEnv: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(`${config.apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${config.apiPrefix}/users`, userRoutes);
app.use(`${config.apiPrefix}/sales`, salesRoutes);
app.use(`${config.apiPrefix}/metrics`, metricsRoutes);

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const { MetricsCollector } = require('@/utils/metrics');
  const metrics = MetricsCollector.generatePrometheusMetrics();
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backoffice Veículos API',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
