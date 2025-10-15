import { Request, Response, NextFunction } from 'express';
import { logger, requestLogger, logError, logAudit, logSecurity } from '@/utils/logger';

export interface LoggingMiddlewareOptions {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logPerformance: boolean;
  sensitiveFields: string[];
  excludePaths: string[];
}

export class LoggingMiddleware {
  private static defaultOptions: LoggingMiddlewareOptions = {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
    sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization'],
    excludePaths: ['/health', '/metrics', '/health/ready', '/health/live']
  };

  /**
   * Middleware principal de logging
   */
  static create(options: Partial<LoggingMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      // Pula logging para paths específicos
      if (config.excludePaths.includes(req.path)) {
        return next();
      }

      const startTime = Date.now();
      const requestId = req.headers['x-request-id'] as string || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Adiciona request ID ao request
      (req as any).requestId = requestId;

      // Log da requisição
      if (config.logRequests) {
        this.logRequest(req, requestId);
      }

      // Intercepta erros
      if (config.logErrors) {
        const originalError = res.locals.error;
        res.locals.error = (error: any) => {
          this.logError(error, req, requestId);
          return originalError ? originalError(error) : error;
        };
      }

      // Intercepta o fim da resposta
      if (config.logResponses || config.logPerformance) {
        const originalSend = res.send;
        res.send = function(data: any) {
          const responseTime = Date.now() - startTime;
          
          if (config.logResponses) {
            LoggingMiddleware.logResponse(req, res, responseTime, requestId);
          }

          if (config.logPerformance && responseTime > 1000) {
            LoggingMiddleware.logPerformance(req, res, responseTime, requestId);
          }

          return originalSend.call(this, data);
        };
      }

      next();
    };
  }

  /**
   * Log de requisição
   */
  private static logRequest(req: Request, requestId: string): void {
    const sanitizedHeaders = this.sanitizeObject(req.headers);
    const sanitizedQuery = this.sanitizeObject(req.query);
    const sanitizedBody = this.sanitizeObject(req.body);

    logger.info('HTTP Request', {
      requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      headers: sanitizedHeaders,
      query: sanitizedQuery,
      body: sanitizedBody,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      type: 'request'
    });
  }

  /**
   * Log de resposta
   */
  private static logResponse(req: Request, res: Response, responseTime: number, requestId: string): void {
    logger.info('HTTP Response', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      type: 'response'
    });
  }

  /**
   * Log de performance
   */
  private static logPerformance(req: Request, res: Response, responseTime: number, requestId: string): void {
    logger.warn('Slow Response', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      threshold: 1000,
      timestamp: new Date().toISOString(),
      type: 'performance'
    });
  }

  /**
   * Log de erro
   */
  private static logError(error: any, req: Request, requestId: string): void {
    logError(error, {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Remove campos sensíveis dos objetos
   */
  private static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = { ...obj };
    
    this.defaultOptions.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Remove campos sensíveis aninhados
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    });

    return sanitized;
  }

  /**
   * Middleware para logging de auditoria
   */
  static auditLog(action: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user?.id || 'anonymous';
      const requestId = (req as any).requestId;

      logAudit(action, user, {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      next();
    };
  }

  /**
   * Middleware para logging de segurança
   */
  static securityLog(event: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = (req as any).requestId;

      logSecurity(event, {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        headers: this.sanitizeObject(req.headers)
      });

      next();
    };
  }

  /**
   * Middleware para logging de autenticação
   */
  static authLog() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = (req as any).requestId;
      const authHeader = req.get('Authorization');
      const hasAuth = !!authHeader;

      if (hasAuth) {
        logAudit('Authentication attempt', 'unknown', {
          requestId,
          method: req.method,
          url: req.url,
          ip: req.ip,
          hasToken: true
        });
      }

      next();
    };
  }

  /**
   * Middleware para logging de rate limiting
   */
  static rateLimitLog() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = (req as any).requestId;
      const rateLimitInfo = {
        limit: res.get('X-RateLimit-Limit'),
        remaining: res.get('X-RateLimit-Remaining'),
        reset: res.get('X-RateLimit-Reset')
      };

      if (rateLimitInfo.limit) {
        logger.info('Rate limit info', {
          requestId,
          ...rateLimitInfo,
          type: 'rate_limit'
        });
      }

      next();
    };
  }
}
