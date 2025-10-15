import { Request, Response, NextFunction } from 'express';
import { MetricsCollector } from '@/utils/metrics';
import { AlertingService } from '@/services/alerting.service';
import { logger } from '@/utils/logger';

export interface MetricsMiddlewareOptions {
  enabled: boolean;
  alertThresholds: {
    responseTime: number; // ms
    errorRate: number; // percentage
  };
  collectUserMetrics: boolean;
  excludePaths: string[];
}

export class MetricsMiddleware {
  private static alertingService = AlertingService.getInstance();
  private static defaultOptions: MetricsMiddlewareOptions = {
    enabled: true,
    alertThresholds: {
      responseTime: 2000, // 2 segundos
      errorRate: 5.0 // 5%
    },
    collectUserMetrics: true,
    excludePaths: ['/health', '/metrics', '/health/ready', '/health/live']
  };

  /**
   * Middleware principal de métricas
   */
  static create(options: Partial<MetricsMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      // Pula coleta para paths específicos
      if (config.excludePaths.includes(req.path)) {
        return next();
      }

      if (!config.enabled) {
        return next();
      }

      const startTime = Date.now();
      const requestId = (req as any).requestId || 'unknown';

      // Intercepta o fim da resposta
      const originalSend = res.send;
      res.send = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        try {
          // Coleta métricas
          MetricsCollector.collectRequestMetrics(req, res, responseTime);

          // Verifica thresholds e envia alertas se necessário
          MetricsMiddleware.checkThresholds(req, res, responseTime, config);

          // Log de métricas se necessário
          if (responseTime > 1000) {
            logger.warn('Slow request detected', {
              requestId,
              method: req.method,
              path: req.path,
              responseTime,
              statusCode: res.statusCode,
              type: 'performance'
            });
          }

        } catch (error) {
          logger.error('Error collecting metrics', {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: 'metrics_error'
          });
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Verifica thresholds e envia alertas
   */
  private static async checkThresholds(
    req: Request, 
    res: Response, 
    responseTime: number, 
    config: MetricsMiddlewareOptions
  ): Promise<void> {
    try {
      // Verifica tempo de resposta
      if (responseTime > config.alertThresholds.responseTime) {
        await this.alertingService.sendAlert(
          'response_time',
          'warning',
          'Slow Response Detected',
          `Request to ${req.path} took ${responseTime}ms, exceeding threshold of ${config.alertThresholds.responseTime}ms`,
          {
            method: req.method,
            path: req.path,
            responseTime,
            threshold: config.alertThresholds.responseTime,
            statusCode: res.statusCode
          }
        );
      }

      // Verifica taxa de erro (calcula para os últimos 5 minutos)
      const metrics = MetricsCollector.calculatePerformanceMetrics(5);
      if (metrics.errorRate > config.alertThresholds.errorRate) {
        await this.alertingService.sendAlert(
          'error_rate',
          'critical',
          'High Error Rate Detected',
          `Error rate is ${metrics.errorRate}%, exceeding threshold of ${config.alertThresholds.errorRate}%`,
          {
            errorRate: metrics.errorRate,
            threshold: config.alertThresholds.errorRate,
            totalRequests: metrics.totalRequests,
            timeWindow: '5 minutes'
          }
        );
      }

    } catch (error) {
      logger.error('Error checking thresholds', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'threshold_check_error'
      });
    }
  }

  /**
   * Middleware para métricas de endpoint específico
   */
  static endpointMetrics(endpoint: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      const requestId = (req as any).requestId || 'unknown';

      const originalSend = res.send;
      res.send = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        logger.info('Endpoint metric', {
          requestId,
          endpoint,
          method: req.method,
          path: req.path,
          responseTime,
          statusCode: res.statusCode,
          type: 'endpoint_metric'
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware para métricas de usuário
   */
  static userMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      const requestId = (req as any).requestId || 'unknown';
      const userId = (req as any).user?.id;

      if (!userId) {
        return next();
      }

      const originalSend = res.send;
      res.send = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        logger.info('User metric', {
          requestId,
          userId,
          method: req.method,
          path: req.path,
          responseTime,
          statusCode: res.statusCode,
          type: 'user_metric'
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware para métricas de autenticação
   */
  static authMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      const requestId = (req as any).requestId || 'unknown';
      const hasAuth = !!(req as any).user;

      const originalSend = res.send;
      res.send = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        logger.info('Auth metric', {
          requestId,
          hasAuth,
          method: req.method,
          path: req.path,
          responseTime,
          statusCode: res.statusCode,
          type: 'auth_metric'
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware para métricas de rate limiting
   */
  static rateLimitMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = (req as any).requestId || 'unknown';

      const originalSend = res.send;
      res.send = function(data: any) {
        const rateLimitInfo = {
          limit: res.get('X-RateLimit-Limit'),
          remaining: res.get('X-RateLimit-Remaining'),
          reset: res.get('X-RateLimit-Reset')
        };

        if (rateLimitInfo.limit) {
          logger.info('Rate limit metric', {
            requestId,
            method: req.method,
            path: req.path,
            ...rateLimitInfo,
            type: 'rate_limit_metric'
          });
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware para métricas de cache
   */
  static cacheMetrics() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = (req as any).requestId || 'unknown';
      const cacheHit = res.get('X-Cache') === 'HIT';
      const cacheMiss = res.get('X-Cache') === 'MISS';

      if (cacheHit || cacheMiss) {
        const originalSend = res.send;
        res.send = function(data: any) {
          logger.info('Cache metric', {
            requestId,
            method: req.method,
            path: req.path,
            cacheHit,
            cacheMiss,
            statusCode: res.statusCode,
            type: 'cache_metric'
          });

          return originalSend.call(this, data);
        };
      }

      next();
    };
  }

  /**
   * Obtém estatísticas de métricas
   */
  static getMetricsStats(): {
    general: any;
    performance: any;
    byEndpoint: any;
    byUser: any;
  } {
    return {
      general: MetricsCollector.getGeneralStats(),
      performance: MetricsCollector.calculatePerformanceMetrics(),
      byEndpoint: MetricsCollector.getMetricsByEndpoint(),
      byUser: MetricsCollector.getMetricsByUser()
    };
  }

  /**
   * Limpa métricas antigas
   */
  static cleanupMetrics(maxAgeMinutes: number = 60): number {
    return MetricsCollector.cleanupOldMetrics(maxAgeMinutes);
  }
}
