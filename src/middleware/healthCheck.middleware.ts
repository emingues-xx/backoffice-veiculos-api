import { Request, Response, NextFunction } from 'express';
import { HealthCheckUtils } from '@/utils/healthCheck.utils';
import { AlertingService } from '@/services/alerting.service';
import { logger } from '@/utils/logger';

export interface HealthCheckMiddlewareOptions {
  enabled: boolean;
  timeout: number; // ms
  alertOnFailure: boolean;
  skipPaths?: string[];
}

export class HealthCheckMiddleware {
  private static alertingService = AlertingService.getInstance();
  private static lastHealthCheck = Date.now();
  private static consecutiveFailures = 0;

  /**
   * Middleware para verificação de saúde da aplicação
   */
  static create(options: HealthCheckMiddlewareOptions = {
    enabled: true,
    timeout: 5000,
    alertOnFailure: true,
    skipPaths: ['/health', '/metrics', '/health/ready', '/health/live']
  }) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Pula verificação para paths específicos
      if (options.skipPaths?.includes(req.path)) {
        return next();
      }

      if (!options.enabled) {
        return next();
      }

      try {
        const startTime = Date.now();
        const healthResult = await HealthCheckUtils.performHealthCheck();
        const responseTime = Date.now() - startTime;

        // Verifica se a resposta está dentro do timeout
        if (responseTime > options.timeout) {
          logger.warn('Health check timeout', {
            responseTime,
            timeout: options.timeout,
            path: req.path
          });

          if (options.alertOnFailure) {
            await this.alertingService.sendAlert(
              'response_time',
              'warning',
              'Health Check Timeout',
              `Health check took ${responseTime}ms, exceeding timeout of ${options.timeout}ms`,
              {
                responseTime,
                timeout: options.timeout,
                path: req.path
              }
            );
          }
        }

        // Verifica se há problemas críticos
        if (healthResult.status === 'unhealthy') {
          this.consecutiveFailures++;
          
          if (options.alertOnFailure && this.consecutiveFailures >= 3) {
            await this.alertingService.sendAlert(
              'data_validation',
              'critical',
              'Application Health Critical',
              `Application health check failed: ${healthResult.database.status}`,
              {
                status: healthResult.status,
                database: healthResult.database,
                memory: healthResult.memory,
                consecutiveFailures: this.consecutiveFailures
              }
            );
          }
        } else {
          this.consecutiveFailures = 0;
        }

        this.lastHealthCheck = Date.now();

        // Adiciona informações de saúde ao request
        (req as any).healthStatus = {
          status: healthResult.status,
          responseTime,
          timestamp: new Date().toISOString()
        };

        next();
      } catch (error) {
        logger.error('Health check middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: req.path
        });

        if (options.alertOnFailure) {
          await this.alertingService.sendAlert(
            'data_validation',
            'critical',
            'Health Check Middleware Error',
            `Health check middleware failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            {
              path: req.path,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          );
        }

        // Continua mesmo com erro para não bloquear a aplicação
        next();
      }
    };
  }

  /**
   * Middleware para verificação rápida de saúde (sem alertas)
   */
  static quickCheck() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Verificação rápida apenas do banco de dados
        const dbCheck = await HealthCheckUtils.checkDatabase();
        
        if (dbCheck.status !== 'connected') {
          logger.warn('Database connection issue detected', {
            status: dbCheck.status,
            path: req.path
          });
        }

        (req as any).dbStatus = dbCheck.status;
        next();
      } catch (error) {
        logger.error('Quick health check error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: req.path
        });
        next();
      }
    };
  }

  /**
   * Middleware para monitoramento de performance
   */
  static performanceMonitor() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      
      // Intercepta o fim da resposta
      const originalSend = res.send;
      res.send = function(data: any) {
        const responseTime = Date.now() - startTime;
        
        // Log de performance
        logger.info('Request performance', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTime,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        // Alerta se resposta muito lenta
        if (responseTime > 2000) { // 2 segundos
          logger.warn('Slow response detected', {
            method: req.method,
            path: req.path,
            responseTime,
            statusCode: res.statusCode
          });
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Obtém status do último health check
   */
  static getLastHealthCheckStatus(): {
    lastCheck: number;
    consecutiveFailures: number;
    timeSinceLastCheck: number;
  } {
    return {
      lastCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures,
      timeSinceLastCheck: Date.now() - this.lastHealthCheck
    };
  }

  /**
   * Reseta contador de falhas consecutivas
   */
  static resetFailureCount(): void {
    this.consecutiveFailures = 0;
    logger.info('Health check failure count reset');
  }
}
