import winston from 'winston';
import { config } from '@/config/config';

// Define format customizado para logs estruturados
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'backoffice-veiculos-api',
      environment: config.nodeEnv,
      ...meta
    };
    
    return JSON.stringify(logEntry);
  })
);

// Define format para desenvolvimento (mais legível)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Configuração dos transports
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: config.logLevel,
    format: config.isDevelopment ? devFormat : logFormat,
    silent: config.isTest
  })
);

// File transport para produção
if (config.isProduction) {
  // Log de erros
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Log geral
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Log de auditoria
  transports.push(
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  );
}

// Cria o logger
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports,
  exitOnError: false
});

// Adiciona métodos customizados para diferentes tipos de log
export const auditLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, { ...meta, type: 'audit' });
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, { ...meta, type: 'audit' });
  },
  error: (message: string, meta?: any) => {
    logger.error(message, { ...meta, type: 'audit' });
  }
};

export const performanceLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, { ...meta, type: 'performance' });
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, { ...meta, type: 'performance' });
  },
  error: (message: string, meta?: any) => {
    logger.error(message, { ...meta, type: 'performance' });
  }
};

export const securityLogger = {
  info: (message: string, meta?: any) => {
    logger.info(message, { ...meta, type: 'security' });
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, { ...meta, type: 'security' });
  },
  error: (message: string, meta?: any) => {
    logger.error(message, { ...meta, type: 'security' });
  }
};

// Middleware para logging de requests
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Adiciona request ID ao request
  req.requestId = requestId;
  
  // Log da requisição
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    type: 'request'
  });

  // Intercepta o fim da resposta
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    // Log da resposta
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      type: 'response'
    });

    // Log de performance se resposta lenta
    if (responseTime > 1000) {
      performanceLogger.warn('Slow response detected', {
        requestId,
        method: req.method,
        url: req.url,
        responseTime,
        statusCode: res.statusCode
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Função para logging estruturado de erros
export const logError = (error: Error, context?: any) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
    type: 'error'
  });
};

// Função para logging de métricas
export const logMetrics = (metrics: any) => {
  performanceLogger.info('Application metrics', {
    ...metrics,
    type: 'metrics'
  });
};

// Função para logging de auditoria
export const logAudit = (action: string, user?: string, details?: any) => {
  auditLogger.info('Audit log', {
    action,
    user,
    timestamp: new Date().toISOString(),
    ...details,
    type: 'audit'
  });
};

// Função para logging de segurança
export const logSecurity = (event: string, details?: any) => {
  securityLogger.warn('Security event', {
    event,
    timestamp: new Date().toISOString(),
    ...details,
    type: 'security'
  });
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Application shutting down gracefully');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Application shutting down gracefully');
  logger.end();
});

export default logger;