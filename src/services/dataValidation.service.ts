import { logger } from '@/utils/logger';
import { AlertingService } from './alerting.service';

export interface ValidationRule {
  field: string;
  type: 'required' | 'string' | 'number' | 'email' | 'date' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataValidationService {
  private static alertingService = AlertingService.getInstance();

  /**
   * Valida dados de vendas do dashboard
   */
  static validateSalesData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Campos obrigatórios
    const requiredFields = ['vehicleId', 'buyerId', 'saleDate', 'price', 'status'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Campo obrigatório '${field}' está ausente`);
      }
    });

    // Validação de tipos
    if (data.vehicleId && typeof data.vehicleId !== 'string') {
      errors.push('vehicleId deve ser uma string');
    }

    if (data.buyerId && typeof data.buyerId !== 'string') {
      errors.push('buyerId deve ser uma string');
    }

    if (data.price && (typeof data.price !== 'number' || data.price <= 0)) {
      errors.push('price deve ser um número positivo');
    }

    // Validação de data
    if (data.saleDate) {
      const saleDate = new Date(data.saleDate);
      if (isNaN(saleDate.getTime())) {
        errors.push('saleDate deve ser uma data válida');
      } else {
        const now = new Date();
        if (saleDate > now) {
          warnings.push('Data de venda está no futuro');
        }
        if (saleDate < new Date('2020-01-01')) {
          warnings.push('Data de venda muito antiga');
        }
      }
    }

    // Validação de status
    const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status deve ser um dos seguintes: ${validStatuses.join(', ')}`);
    }

    // Validação de consistência de timestamps
    if (data.createdAt && data.updatedAt) {
      const createdAt = new Date(data.createdAt);
      const updatedAt = new Date(data.updatedAt);
      if (updatedAt < createdAt) {
        errors.push('updatedAt não pode ser anterior a createdAt');
      }
    }

    // Validação de ranges
    if (data.price && (data.price < 1000 || data.price > 1000000)) {
      warnings.push('Preço fora do range esperado (R$ 1.000 - R$ 1.000.000)');
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    // Log de validação
    if (!result.isValid) {
      logger.warn('Data validation failed', {
        errors: result.errors,
        warnings: result.warnings,
        data: this.sanitizeData(data),
        type: 'validation'
      });

      // Envia alerta se há erros críticos
      if (result.errors.length > 0) {
        this.alertingService.sendAlert(
          'data_validation',
          'critical',
          'Falha na Validação de Dados de Vendas',
          `Dados de vendas inválidos detectados: ${result.errors.join(', ')}`,
          {
            errors: result.errors,
            warnings: result.warnings,
            dataType: 'sales'
          }
        );
      }
    }

    return result;
  }

  /**
   * Valida dados de veículos
   */
  static validateVehicleData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Campos obrigatórios
    const requiredFields = ['brand', 'model', 'year', 'price', 'mileage'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Campo obrigatório '${field}' está ausente`);
      }
    });

    // Validação de ano
    if (data.year) {
      const currentYear = new Date().getFullYear();
      if (data.year < 1990 || data.year > currentYear + 1) {
        errors.push(`Ano deve estar entre 1990 e ${currentYear + 1}`);
      }
    }

    // Validação de quilometragem
    if (data.mileage && (data.mileage < 0 || data.mileage > 1000000)) {
      warnings.push('Quilometragem fora do range esperado (0 - 1.000.000 km)');
    }

    // Validação de preço
    if (data.price && (data.price < 5000 || data.price > 2000000)) {
      warnings.push('Preço fora do range esperado (R$ 5.000 - R$ 2.000.000)');
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    if (!result.isValid) {
      logger.warn('Vehicle data validation failed', {
        errors: result.errors,
        warnings: result.warnings,
        data: this.sanitizeData(data),
        type: 'validation'
      });
    }

    return result;
  }

  /**
   * Valida dados de usuários
   */
  static validateUserData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Campos obrigatórios
    const requiredFields = ['name', 'email'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`Campo obrigatório '${field}' está ausente`);
      }
    });

    // Validação de email
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email deve ter formato válido');
      }
    }

    // Validação de nome
    if (data.name && data.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Validação de telefone
    if (data.phone) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(data.phone)) {
        warnings.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    if (!result.isValid) {
      logger.warn('User data validation failed', {
        errors: result.errors,
        warnings: result.warnings,
        data: this.sanitizeData(data),
        type: 'validation'
      });
    }

    return result;
  }

  /**
   * Valida integridade de dados do dashboard
   */
  static validateDashboardIntegrity(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verifica consistência de timestamps
    if (data.sales) {
      data.sales.forEach((sale: any, index: number) => {
        if (sale.createdAt && sale.updatedAt) {
          const createdAt = new Date(sale.createdAt);
          const updatedAt = new Date(sale.updatedAt);
          if (updatedAt < createdAt) {
            errors.push(`Venda ${index}: updatedAt anterior a createdAt`);
          }
        }
      });
    }

    // Verifica consistência de IDs
    if (data.sales && data.vehicles) {
      const vehicleIds = data.vehicles.map((v: any) => v._id);
      data.sales.forEach((sale: any, index: number) => {
        if (sale.vehicleId && !vehicleIds.includes(sale.vehicleId)) {
          errors.push(`Venda ${index}: vehicleId não encontrado na lista de veículos`);
        }
      });
    }

    // Verifica consistência de usuários
    if (data.sales && data.users) {
      const userIds = data.users.map((u: any) => u._id);
      data.sales.forEach((sale: any, index: number) => {
        if (sale.buyerId && !userIds.includes(sale.buyerId)) {
          errors.push(`Venda ${index}: buyerId não encontrado na lista de usuários`);
        }
      });
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    if (!result.isValid) {
      logger.error('Dashboard integrity validation failed', {
        errors: result.errors,
        warnings: result.warnings,
        type: 'integrity_validation'
      });

      // Envia alerta crítico para problemas de integridade
      this.alertingService.sendAlert(
        'data_validation',
        'critical',
        'Falha na Integridade dos Dados do Dashboard',
        `Problemas de integridade detectados: ${result.errors.join(', ')}`,
        {
          errors: result.errors,
          warnings: result.warnings,
          dataType: 'dashboard_integrity'
        }
      );
    }

    return result;
  }

  /**
   * Remove dados sensíveis para logging
   */
  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Valida dados genéricos com regras customizadas
   */
  static validateWithRules(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];

      // Verifica campo obrigatório
      if (rule.type === 'required' && !value) {
        errors.push(`Campo '${rule.field}' é obrigatório`);
        return;
      }

      if (!value) return; // Pula validações se campo não existe

      // Validação de tipo
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Campo '${rule.field}' deve ser uma string`);
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push(`Campo '${rule.field}' deve ter pelo menos ${rule.minLength} caracteres`);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push(`Campo '${rule.field}' deve ter no máximo ${rule.maxLength} caracteres`);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              errors.push(`Campo '${rule.field}' não atende ao padrão esperado`);
            }
          }
          break;

        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Campo '${rule.field}' deve ser um número`);
          } else {
            if (rule.min !== undefined && value < rule.min) {
              errors.push(`Campo '${rule.field}' deve ser maior ou igual a ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push(`Campo '${rule.field}' deve ser menor ou igual a ${rule.max}`);
            }
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`Campo '${rule.field}' deve ser um email válido`);
          }
          break;

        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`Campo '${rule.field}' deve ser uma data válida`);
          }
          break;
      }

      // Validação customizada
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          errors.push(`Campo '${rule.field}': ${customResult}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
