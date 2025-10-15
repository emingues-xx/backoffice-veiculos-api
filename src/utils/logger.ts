import morgan from 'morgan';
import { config } from '@/config/config';

/**
 * Logger estruturado para aplicação
 */
class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const logEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...context,
    };
    return JSON.stringify(logEntry);
  }

  info(message: string, context?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    } else {
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    if (config.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorContext);
    } else {
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (config.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  http(message: string, context?: Record<string, any>): void {
    if (config.logLevel === 'debug' || config.isDevelopment) {
      if (config.isDevelopment) {
        console.log(`[HTTP] ${message}`, context || '');
      } else {
        console.log(this.formatMessage('HTTP', message, context));
      }
    }
  }
}

export const logger = new Logger();

/**
 * Morgan middleware configurado para logging estruturado
 */
export const morganMiddleware = morgan(
  (tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: `${tokens['response-time'](req, res)}ms`,
      remoteAddr: tokens['remote-addr'](req, res),
      userAgent: tokens['user-agent'](req, res),
    };

    logger.http('HTTP Request', logData);
    return null; // Morgan já faz o console.log, retornamos null para evitar duplicação
  },
  {
    skip: (req) => {
      // Skip health check endpoints para reduzir ruído
      return req.url === '/health' || req.url === '/api/health';
    },
  }
);

/**
 * Alerta de erro crítico (pode ser integrado com serviços externos)
 */
export const alertCriticalError = (message: string, error: Error | unknown, context?: Record<string, any>): void => {
  logger.error(`[CRITICAL] ${message}`, error, { ...context, critical: true });

  // TODO: Integrar com serviço de alertas (Slack, Email, Sentry, etc.)
  if (config.isProduction) {
    // Implementar integração com serviço de notificação
    // Ex: sendToSlack, sendEmail, etc.
  }
};
