import { Request, Response } from 'express';
import { HealthCheckUtils, HealthCheckResult } from '@/utils/healthCheck.utils';
import { config } from '@/config/config';

export class HealthController {
  /**
   * Endpoint de health check básico
   */
  static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const healthResult = await HealthCheckUtils.performHealthCheck();
      const responseTime = Date.now() - startTime;

      // Determina o status HTTP baseado no resultado
      const httpStatus = healthResult.status === 'healthy' ? 200 : 
                        healthResult.status === 'degraded' ? 200 : 503;

      // Adiciona informações de performance
      const response = {
        ...healthResult,
        performance: {
          responseTime,
          threshold: 200 // ms
        },
        version: '1.0.0',
        environment: config.nodeEnv
      };

      res.status(httpStatus).json({
        success: healthResult.status === 'healthy',
        data: response
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint de health check detalhado
   */
  static async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      const healthResult = await HealthCheckUtils.performHealthCheck();
      const responseTime = Date.now() - startTime;

      // Verifica se a resposta está dentro do limite de tempo
      const isResponseTimeOk = responseTime < 200;
      
      const httpStatus = healthResult.status === 'healthy' && isResponseTimeOk ? 200 : 
                        healthResult.status === 'degraded' ? 200 : 503;

      const response = {
        ...healthResult,
        performance: {
          responseTime,
          threshold: 200,
          withinThreshold: isResponseTimeOk
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid
        },
        version: '1.0.0',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
      };

      res.status(httpStatus).json({
        success: healthResult.status === 'healthy' && isResponseTimeOk,
        data: response
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint de métricas no formato Prometheus
   */
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await HealthCheckUtils.performHealthCheck();
      const prometheusMetrics = HealthCheckUtils.generatePrometheusMetrics(healthResult);

      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.status(200).send(prometheusMetrics);
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Metrics collection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint de readiness (para Kubernetes)
   */
  static async getReadiness(req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await HealthCheckUtils.performHealthCheck();
      
      // Para readiness, verificamos se os serviços críticos estão funcionando
      const isReady = healthResult.database.status === 'connected' && 
                     healthResult.memory.percentage < 95;

      const httpStatus = isReady ? 200 : 503;

      res.status(httpStatus).json({
        success: isReady,
        data: {
          ready: isReady,
          database: healthResult.database.status,
          memory: healthResult.memory.percentage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Readiness check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint de liveness (para Kubernetes)
   */
  static async getLiveness(req: Request, res: Response): Promise<void> {
    try {
      // Para liveness, apenas verificamos se a aplicação está respondendo
      res.status(200).json({
        success: true,
        data: {
          alive: true,
          uptime: HealthCheckUtils.getUptime(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Liveness check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
