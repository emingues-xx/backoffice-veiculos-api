import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '@/types/api.types';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: errorMessage,
        details: error.details
      });
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Query validation error',
        message: errorMessage,
        details: error.details
      });
      return;
    }
    
    next();
  };
};

export const validateParams = (schema: Joi.Schema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        success: false,
        error: 'Parameter validation error',
        message: errorMessage,
        details: error.details
      });
      return;
    }
    
    next();
  };
};
