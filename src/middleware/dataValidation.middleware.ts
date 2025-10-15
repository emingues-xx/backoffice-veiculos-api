import { Request, Response, NextFunction } from 'express';
import { DataValidationService, ValidationRule } from '@/services/dataValidation.service';
import { logger } from '@/utils/logger';

export interface ValidationMiddlewareOptions {
  enabled: boolean;
  validateSales: boolean;
  validateVehicles: boolean;
  validateUsers: boolean;
  customRules?: ValidationRule[];
  skipPaths: string[];
}

export class DataValidationMiddleware {
  private static defaultOptions: ValidationMiddlewareOptions = {
    enabled: true,
    validateSales: true,
    validateVehicles: true,
    validateUsers: true,
    skipPaths: ['/health', '/metrics', '/health/ready', '/health/live']
  };

  /**
   * Middleware para validação de dados de vendas
   */
  static validateSalesData(options: Partial<ValidationMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      if (!config.enabled || !config.validateSales) {
        return next();
      }

      if (config.skipPaths.includes(req.path)) {
        return next();
      }

      // Aplica apenas para rotas de vendas
      if (!req.path.includes('/sales')) {
        return next();
      }

      // Valida apenas POST e PUT
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
      }

      try {
        const validationResult = DataValidationService.validateSalesData(req.body);

        if (!validationResult.isValid) {
          logger.warn('Sales data validation failed', {
            method: req.method,
            path: req.path,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            requestId: (req as any).requestId
          });

          res.status(400).json({
            success: false,
            error: 'Dados de venda inválidos',
            message: validationResult.errors.join(', '),
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          });
        }

        // Adiciona warnings ao response se houver
        if (validationResult.warnings.length > 0) {
          (req as any).validationWarnings = validationResult.warnings;
        }

        next();
      } catch (error) {
        logger.error('Error in sales data validation middleware', {
          error: error instanceof Error ? error.message : 'Unknown error',
          method: req.method,
          path: req.path,
          requestId: (req as any).requestId
        });

        next();
      }
    };
  }

  /**
   * Middleware para validação de dados de veículos
   */
  static validateVehicleData(options: Partial<ValidationMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      if (!config.enabled || !config.validateVehicles) {
        return next();
      }

      if (config.skipPaths.includes(req.path)) {
        return next();
      }

      // Aplica apenas para rotas de veículos
      if (!req.path.includes('/vehicles')) {
        return next();
      }

      // Valida apenas POST e PUT
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
      }

      try {
        const validationResult = DataValidationService.validateVehicleData(req.body);

        if (!validationResult.isValid) {
          logger.warn('Vehicle data validation failed', {
            method: req.method,
            path: req.path,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            requestId: (req as any).requestId
          });

          res.status(400).json({
            success: false,
            error: 'Dados de veículo inválidos',
            message: validationResult.errors.join(', '),
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          });
        }

        // Adiciona warnings ao response se houver
        if (validationResult.warnings.length > 0) {
          (req as any).validationWarnings = validationResult.warnings;
        }

        next();
      } catch (error) {
        logger.error('Error in vehicle data validation middleware', {
          error: error instanceof Error ? error.message : 'Unknown error',
          method: req.method,
          path: req.path,
          requestId: (req as any).requestId
        });

        next();
      }
    };
  }

  /**
   * Middleware para validação de dados de usuários
   */
  static validateUserData(options: Partial<ValidationMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      if (!config.enabled || !config.validateUsers) {
        return next();
      }

      if (config.skipPaths.includes(req.path)) {
        return next();
      }

      // Aplica apenas para rotas de usuários
      if (!req.path.includes('/users')) {
        return next();
      }

      // Valida apenas POST e PUT
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
      }

      try {
        const validationResult = DataValidationService.validateUserData(req.body);

        if (!validationResult.isValid) {
          logger.warn('User data validation failed', {
            method: req.method,
            path: req.path,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            requestId: (req as any).requestId
          });

          res.status(400).json({
            success: false,
            error: 'Dados de usuário inválidos',
            message: validationResult.errors.join(', '),
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          });
        }

        // Adiciona warnings ao response se houver
        if (validationResult.warnings.length > 0) {
          (req as any).validationWarnings = validationResult.warnings;
        }

        next();
      } catch (error) {
        logger.error('Error in user data validation middleware', {
          error: error instanceof Error ? error.message : 'Unknown error',
          method: req.method,
          path: req.path,
          requestId: (req as any).requestId
        });

        next();
      }
    };
  }

  /**
   * Middleware para validação com regras customizadas
   */
  static validateWithRules(rules: ValidationRule[], options: Partial<ValidationMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      if (!config.enabled) {
        return next();
      }

      if (config.skipPaths.includes(req.path)) {
        return next();
      }

      // Valida apenas POST e PUT
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
      }

      try {
        const validationResult = DataValidationService.validateWithRules(req.body, rules);

        if (!validationResult.isValid) {
          logger.warn('Custom validation failed', {
            method: req.method,
            path: req.path,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            requestId: (req as any).requestId
          });

          res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            message: validationResult.errors.join(', '),
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          });
        }

        // Adiciona warnings ao response se houver
        if (validationResult.warnings.length > 0) {
          (req as any).validationWarnings = validationResult.warnings;
        }

        next();
      } catch (error) {
        logger.error('Error in custom validation middleware', {
          error: error instanceof Error ? error.message : 'Unknown error',
          method: req.method,
          path: req.path,
          requestId: (req as any).requestId
        });

        next();
      }
    };
  }

  /**
   * Middleware para validação de integridade do dashboard
   */
  static validateDashboardIntegrity(options: Partial<ValidationMiddlewareOptions> = {}) {
    const config = { ...this.defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      if (!config.enabled) {
        return next();
      }

      if (config.skipPaths.includes(req.path)) {
        return next();
      }

      // Aplica apenas para rotas de dashboard/metrics
      if (!req.path.includes('/dashboard') && !req.path.includes('/metrics')) {
        return next();
      }

      try {
        const validationResult = DataValidationService.validateDashboardIntegrity(req.body);

        if (!validationResult.isValid) {
          logger.error('Dashboard integrity validation failed', {
            method: req.method,
            path: req.path,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            requestId: (req as any).requestId
          });

          res.status(500).json({
            success: false,
            error: 'Problemas de integridade detectados',
            message: validationResult.errors.join(', '),
            details: {
              errors: validationResult.errors,
              warnings: validationResult.warnings
            }
          });
        }

        next();
      } catch (error) {
        logger.error('Error in dashboard integrity validation middleware', {
          error: error instanceof Error ? error.message : 'Unknown error',
          method: req.method,
          path: req.path,
          requestId: (req as any).requestId
        });

        next();
      }
    };
  }

  /**
   * Middleware para incluir warnings de validação na resposta
   */
  static includeValidationWarnings() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const originalSend = res.send;
      
      res.send = function(data: any) {
        const warnings = (req as any).validationWarnings;
        
        if (warnings && warnings.length > 0) {
          try {
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            if (jsonData && typeof jsonData === 'object') {
              jsonData.warnings = warnings;
              return originalSend.call(this, JSON.stringify(jsonData));
            }
          } catch (error) {
            // Se não conseguir parsear, envia dados originais
          }
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }
}
