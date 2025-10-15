import mongoose from 'mongoose';
import { config } from '@/config/config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    error?: string;
  };
  services: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
  };
}

export class HealthCheckUtils {
  private static startTime = Date.now();

  /**
   * Verifica o status da conexão com o MongoDB
   */
  static async checkDatabase(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      if (mongoose.connection.readyState === 1) {
        // Testa a conexão com um ping
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping();
        }
        const responseTime = Date.now() - startTime;
        
        return {
          status: 'connected',
          responseTime
        };
      } else {
        return {
          status: 'disconnected',
          responseTime: Date.now() - startTime,
          error: 'MongoDB connection not established'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  /**
   * Verifica o uso de memória do processo
   */
  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    const memUsage = process.memoryUsage();
    const total = memUsage.heapTotal;
    const used = memUsage.heapUsed;
    const percentage = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage * 100) / 100
    };
  }

  /**
   * Calcula o uptime da aplicação
   */
  static getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Verifica serviços externos (se configurados)
   */
  static async checkExternalServices(): Promise<{
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
  }> {
    const services: {
      [key: string]: {
        status: 'healthy' | 'unhealthy';
        responseTime: number;
        error?: string;
      };
    } = {};

    // Verifica Redis se configurado
    if (config.redisUrl && config.redisUrl !== 'redis://localhost:6379') {
      try {
        const startTime = Date.now();
        // Aqui você pode implementar uma verificação real do Redis
        // Por enquanto, vamos simular uma verificação
        const responseTime = Date.now() - startTime;
        services.redis = {
          status: 'healthy',
          responseTime
        };
      } catch (error) {
        services.redis = {
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Redis connection failed'
        };
      }
    }

    return services;
  }

  /**
   * Executa todas as verificações de health check
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    const [database, services] = await Promise.all([
      this.checkDatabase(),
      this.checkExternalServices()
    ]);

    const memory = this.getMemoryUsage();
    const uptime = this.getUptime();

    // Determina o status geral
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (database.status !== 'connected') {
      overallStatus = 'unhealthy';
    } else if (memory.percentage > 90) {
      overallStatus = 'degraded';
    } else {
      // Verifica se algum serviço externo está com problema
      const hasUnhealthyService = Object.values(services).some(
        service => service.status === 'unhealthy'
      );
      if (hasUnhealthyService) {
        overallStatus = 'degraded';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      memory,
      database,
      services
    };
  }

  /**
   * Gera métricas no formato Prometheus
   */
  static generatePrometheusMetrics(healthResult: HealthCheckResult): string {
    const labels = `environment="${config.nodeEnv}",version="1.0.0"`;
    
    let metrics = `# HELP api_health_status API health status (1=healthy, 0=unhealthy)
# TYPE api_health_status gauge
api_health_status{${labels}} ${healthResult.status === 'healthy' ? 1 : 0}

# HELP api_uptime_seconds API uptime in seconds
# TYPE api_uptime_seconds counter
api_uptime_seconds{${labels}} ${healthResult.uptime}

# HELP api_memory_usage_bytes API memory usage in bytes
# TYPE api_memory_usage_bytes gauge
api_memory_usage_bytes{${labels}} ${healthResult.memory.used * 1024 * 1024}

# HELP api_memory_usage_percentage API memory usage percentage
# TYPE api_memory_usage_percentage gauge
api_memory_usage_percentage{${labels}} ${healthResult.memory.percentage}

# HELP database_connection_status Database connection status (1=connected, 0=disconnected)
# TYPE database_connection_status gauge
database_connection_status{${labels}} ${healthResult.database.status === 'connected' ? 1 : 0}

# HELP database_response_time_ms Database response time in milliseconds
# TYPE database_response_time_ms gauge
database_response_time_ms{${labels}} ${healthResult.database.responseTime}`;

    // Adiciona métricas dos serviços externos
    Object.entries(healthResult.services).forEach(([serviceName, service]) => {
      const serviceLabels = `${labels},service="${serviceName}"`;
      metrics += `
# HELP external_service_status External service status (1=healthy, 0=unhealthy)
# TYPE external_service_status gauge
external_service_status{${serviceLabels}} ${service.status === 'healthy' ? 1 : 0}

# HELP external_service_response_time_ms External service response time in milliseconds
# TYPE external_service_response_time_ms gauge
external_service_response_time_ms{${serviceLabels}} ${service.responseTime}`;
    });

    return metrics;
  }
}
