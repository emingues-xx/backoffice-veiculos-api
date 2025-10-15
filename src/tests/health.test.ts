import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { connectDatabase } from '../config/database';
import { HealthCheckUtils } from '../utils/healthCheck.utils';

describe('Health Check Endpoints', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /health', () => {
    it('should return health status with 200 status code', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('database');
    });

    it('should respond within 200ms', async () => {
      const startTime = Date.now();
      await request(app).get('/health');
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data.system).toHaveProperty('nodeVersion');
      expect(response.body.data.system).toHaveProperty('platform');
    });
  });

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('api_health_status');
      expect(response.text).toContain('api_uptime_seconds');
      expect(response.text).toContain('database_connection_status');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('ready');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('memory');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('alive');
      expect(response.body.data).toHaveProperty('uptime');
    });
  });
});

describe('HealthCheckUtils', () => {
  describe('checkDatabase', () => {
    it('should return connected status when database is available', async () => {
      const result = await HealthCheckUtils.checkDatabase();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result.status).toBe('connected');
      expect(result.responseTime).toBeGreaterThan(0);
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage information', () => {
      const memory = HealthCheckUtils.getMemoryUsage();
      
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('total');
      expect(memory).toHaveProperty('percentage');
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.percentage).toBeGreaterThan(0);
    });
  });

  describe('getUptime', () => {
    it('should return uptime in seconds', () => {
      const uptime = HealthCheckUtils.getUptime();
      
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(typeof uptime).toBe('number');
    });
  });

  describe('performHealthCheck', () => {
    it('should perform complete health check', async () => {
      const result = await HealthCheckUtils.performHealthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('services');
      expect(['healthy', 'unhealthy', 'degraded']).toContain(result.status);
    });
  });

  describe('generatePrometheusMetrics', () => {
    it('should generate valid Prometheus metrics', async () => {
      const healthResult = await HealthCheckUtils.performHealthCheck();
      const metrics = HealthCheckUtils.generatePrometheusMetrics(healthResult);
      
      expect(metrics).toContain('api_health_status');
      expect(metrics).toContain('api_uptime_seconds');
      expect(metrics).toContain('api_memory_usage_bytes');
      expect(metrics).toContain('database_connection_status');
    });
  });
});
