import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/config';
import { ApiResponse } from '@/types/api.types';
import { logger, logError } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  context?: Record<string, any>;
}

export const createError = (
  message: string,
  statusCode: number = 500,
  context?: Record<string, any>
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.context = context;
  return error;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  const errorContext = {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
    ...error.context,
  };

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((error as any).errors).map((err: any) => err.message).join(', ');
  }

  // Mongoose duplicate key error
  if ((error as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log estruturado baseado na severidade
  if (statusCode >= 500) {
    // Erros de servidor são críticos
    if (error.isOperational === false || statusCode === 500) {
      logError(error, errorContext);
    } else {
      logger.error(message, error, errorContext);
    }
  } else if (statusCode >= 400) {
    // Erros de cliente são warnings
    logger.warn(`Client error: ${message}`, errorContext);
  } else {
    logger.info(`Request error: ${message}`, errorContext);
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    message: config.isDevelopment ? error.stack : 'Something went wrong'
  };

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response<ApiResponse>): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
