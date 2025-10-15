import axios, { AxiosError } from 'axios';
import { config } from '@/config/config';
import { logger, alertCriticalError } from '@/utils/logger';
import { redisClient } from '@/config/redis';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    legacySalesApi: ServiceHealth;
    legacyInventoryApi: ServiceHealth;
  };
  uptime: number;
  version: string;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
  consecutiveFailures?: number;
}

interface FailureTracker {
  [key: string]: {
    count: number;
    lastFailure: Date;
  };
}

class HealthCheckService {
  private failureTracker: FailureTracker = {};
  private lastValidData: HealthCheckResult | null = null;
  private startTime = Date.now();

  /**
   * Executa health check completo de todos os serviços
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkLegacyApi('sales', config.legacySystems.salesApiUrl),
      this.checkLegacyApi('inventory', config.legacySystems.inventoryApiUrl),
    ]);

    const [database, redis, legacySales, legacyInventory] = checks.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        status: 'down' as const,
        error: result.reason?.message || 'Unknown error',
        lastCheck: new Date(),
      };
    });

    const services = {
      database,
      redis,
      legacySalesApi: legacySales,
      legacyInventoryApi: legacyInventory,
    };

    // Determina status geral
    const downCount = Object.values(services).filter((s) => s.status === 'down').length;
    const degradedCount = Object.values(services).filter((s) => s.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (downCount === 0 && degradedCount === 0) {
      overallStatus = 'healthy';
    } else if (downCount >= 2) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date(),
      services,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
    };

    // Armazena última versão válida
    if (overallStatus !== 'unhealthy') {
      this.lastValidData = result;
      await this.cacheHealthCheck(result);
    }

    // Alerta em caso de falhas críticas
    if (overallStatus === 'unhealthy') {
      alertCriticalError('System health check failed', new Error('Multiple services down'), {
        services,
      });
    }

    // Processa falhas individuais
    Object.entries(services).forEach(([serviceName, health]) => {
      if (health.status === 'down') {
        this.trackFailure(serviceName);
        this.checkAlertThreshold(serviceName);
      } else {
        this.resetFailureTracker(serviceName);
      }
    });

    return result;
  }

  /**
   * Verifica conexão com banco de dados
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const mongoose = await import('mongoose');

      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }

      // Ping simples ao banco
      await mongoose.connection.db.admin().ping();

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 1000 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date(),
      };
    } catch (error) {
      logger.error('Database health check failed', error);
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Verifica conexão com Redis
   */
  private async checkRedis(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      await redisClient.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 500 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date(),
      };
    } catch (error) {
      logger.error('Redis health check failed', error);
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Verifica integração com API legada
   */
  private async checkLegacyApi(name: string, url: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < config.healthCheck.retries) {
      try {
        const response = await axios.get(`${url}/health`, {
          timeout: config.healthCheck.timeout,
          validateStatus: (status) => status < 500,
        });

        const responseTime = Date.now() - startTime;

        if (response.status >= 200 && response.status < 300) {
          return {
            status: responseTime > 2000 ? 'degraded' : 'up',
            responseTime,
            lastCheck: new Date(),
          };
        }

        throw new Error(`API returned status ${response.status}`);
      } catch (error) {
        attempt++;
        if (attempt >= config.healthCheck.retries) {
          const axiosError = error as AxiosError;
          logger.warn(`Legacy ${name} API health check failed after ${attempt} attempts`, {
            url,
            error: axiosError.message,
          });

          return {
            status: 'down',
            error: axiosError.message || 'Connection failed',
            lastCheck: new Date(),
            responseTime: Date.now() - startTime,
          };
        }
        // Pequeno delay entre tentativas
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Fallback (nunca deve chegar aqui)
    return {
      status: 'down',
      error: 'Max retries exceeded',
      lastCheck: new Date(),
    };
  }

  /**
   * Rastreia falhas consecutivas de um serviço
   */
  private trackFailure(serviceName: string): void {
    if (!this.failureTracker[serviceName]) {
      this.failureTracker[serviceName] = {
        count: 0,
        lastFailure: new Date(),
      };
    }

    this.failureTracker[serviceName].count++;
    this.failureTracker[serviceName].lastFailure = new Date();
  }

  /**
   * Reseta contador de falhas
   */
  private resetFailureTracker(serviceName: string): void {
    if (this.failureTracker[serviceName]) {
      delete this.failureTracker[serviceName];
    }
  }

  /**
   * Verifica se atingiu threshold de alertas
   */
  private checkAlertThreshold(serviceName: string): void {
    const tracker = this.failureTracker[serviceName];
    if (tracker && tracker.count >= config.healthCheck.alertThreshold) {
      alertCriticalError(
        `Service ${serviceName} has failed ${tracker.count} consecutive times`,
        new Error('Service health threshold exceeded'),
        {
          serviceName,
          consecutiveFailures: tracker.count,
          lastFailure: tracker.lastFailure,
        }
      );
    }
  }

  /**
   * Cacheia resultado do health check
   */
  private async cacheHealthCheck(result: HealthCheckResult): Promise<void> {
    try {
      await redisClient.setEx(
        'system:health:last_valid',
        config.cacheFallbackTTL,
        JSON.stringify(result)
      );
    } catch (error) {
      logger.warn('Failed to cache health check result', { error });
    }
  }

  /**
   * Recupera último health check válido do cache
   */
  async getLastValidHealthCheck(): Promise<HealthCheckResult | null> {
    try {
      const cached = await redisClient.get('system:health:last_valid');
      if (cached) {
        return JSON.parse(cached) as HealthCheckResult;
      }
    } catch (error) {
      logger.warn('Failed to retrieve cached health check', { error });
    }

    return this.lastValidData;
  }

  /**
   * Retorna health check com fallback para últimos dados válidos
   */
  async getHealthWithFallback(): Promise<{ current: HealthCheckResult; usingFallback: boolean }> {
    try {
      const current = await this.checkHealth();

      if (current.status === 'unhealthy') {
        const fallback = await this.getLastValidHealthCheck();
        if (fallback) {
          logger.warn('Using fallback health check data due to unhealthy status');
          return { current: fallback, usingFallback: true };
        }
      }

      return { current, usingFallback: false };
    } catch (error) {
      logger.error('Health check failed completely', error);
      const fallback = await this.getLastValidHealthCheck();

      if (fallback) {
        return { current: fallback, usingFallback: true };
      }

      throw error;
    }
  }

  /**
   * Verifica se sistema está pronto para receber requests
   */
  async isReady(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }

  /**
   * Verifica se sistema está vivo (liveness probe)
   */
  isAlive(): boolean {
    return true; // Se chegou aqui, processo está rodando
  }
}

export default new HealthCheckService();
