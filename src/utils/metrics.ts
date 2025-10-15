import { Request, Response } from 'express';
import { logger } from './logger';

export interface MetricsData {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  statusCodes: { [key: number]: number };
}

export class MetricsCollector {
  private static metrics: MetricsData[] = [];
  private static maxMetrics = 10000; // Mantém apenas os últimos 10k registros
  private static startTime = Date.now();

  /**
   * Coleta métricas de uma requisição
   */
  static collectRequestMetrics(req: Request, res: Response, responseTime: number): void {
    const requestId = (req as any).requestId || 'unknown';
    const userId = (req as any).user?.id;

    const metric: MetricsData = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId
    };

    this.metrics.push(metric);

    // Remove métricas antigas se exceder o limite
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log da métrica
    logger.info('Request metric collected', {
      ...metric,
      type: 'metric'
    });
  }

  /**
   * Calcula métricas de performance
   */
  static calculatePerformanceMetrics(timeWindowMinutes: number = 5): PerformanceMetrics {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    );

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0,
        statusCodes: {}
      };
    }

    // Calcula estatísticas básicas
    const totalRequests = recentMetrics.length;
    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    
    // Calcula percentis
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    const p95ResponseTime = responseTimes[p95Index] || 0;
    const p99ResponseTime = responseTimes[p99Index] || 0;

    // Calcula taxa de erro
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    // Calcula requests por minuto
    const requestsPerMinute = totalRequests / timeWindowMinutes;

    // Conta códigos de status
    const statusCodes: { [key: number]: number } = {};
    recentMetrics.forEach(metric => {
      statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;
    });

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime,
      p99ResponseTime,
      errorRate: Math.round(errorRate * 100) / 100,
      requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
      statusCodes
    };
  }

  /**
   * Gera métricas no formato Prometheus
   */
  static generatePrometheusMetrics(): string {
    const metrics = this.calculatePerformanceMetrics();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    let prometheusMetrics = `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.totalRequests}

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 0
http_request_duration_seconds_bucket{le="0.5"} 0
http_request_duration_seconds_bucket{le="1"} 0
http_request_duration_seconds_bucket{le="2.5"} 0
http_request_duration_seconds_bucket{le="5"} 0
http_request_duration_seconds_bucket{le="10"} 0
http_request_duration_seconds_bucket{le="+Inf"} ${metrics.totalRequests}
http_request_duration_seconds_sum ${metrics.averageResponseTime * metrics.totalRequests / 1000}
http_request_duration_seconds_count ${metrics.totalRequests}

# HELP http_request_duration_p95_seconds 95th percentile of HTTP request duration
# TYPE http_request_duration_p95_seconds gauge
http_request_duration_p95_seconds ${metrics.p95ResponseTime / 1000}

# HELP http_request_duration_p99_seconds 99th percentile of HTTP request duration
# TYPE http_request_duration_p99_seconds gauge
http_request_duration_p99_seconds ${metrics.p99ResponseTime / 1000}

# HELP http_requests_per_minute HTTP requests per minute
# TYPE http_requests_per_minute gauge
http_requests_per_minute ${metrics.requestsPerMinute}

# HELP http_error_rate HTTP error rate percentage
# TYPE http_error_rate gauge
http_error_rate ${metrics.errorRate}

# HELP application_uptime_seconds Application uptime in seconds
# TYPE application_uptime_seconds counter
application_uptime_seconds ${uptime}`;

    // Adiciona métricas por código de status
    Object.entries(metrics.statusCodes).forEach(([statusCode, count]) => {
      prometheusMetrics += `
# HELP http_requests_by_status HTTP requests by status code
# TYPE http_requests_by_status counter
http_requests_by_status{status="${statusCode}"} ${count}`;
    });

    return prometheusMetrics;
  }

  /**
   * Obtém métricas por endpoint
   */
  static getMetricsByEndpoint(timeWindowMinutes: number = 5): { [endpoint: string]: PerformanceMetrics } {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    );

    const endpointMetrics: { [endpoint: string]: MetricsData[] } = {};
    
    // Agrupa métricas por endpoint
    recentMetrics.forEach(metric => {
      if (!endpointMetrics[metric.path]) {
        endpointMetrics[metric.path] = [];
      }
      endpointMetrics[metric.path].push(metric);
    });

    // Calcula métricas para cada endpoint
    const result: { [endpoint: string]: PerformanceMetrics } = {};
    
    Object.entries(endpointMetrics).forEach(([endpoint, metrics]) => {
      const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
      const totalRequests = metrics.length;
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
      
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p99Index = Math.floor(responseTimes.length * 0.99);
      const p95ResponseTime = responseTimes[p95Index] || 0;
      const p99ResponseTime = responseTimes[p99Index] || 0;

      const errorCount = metrics.filter(m => m.statusCode >= 400).length;
      const errorRate = (errorCount / totalRequests) * 100;

      const statusCodes: { [key: number]: number } = {};
      metrics.forEach(metric => {
        statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;
      });

      result[endpoint] = {
        totalRequests,
        averageResponseTime: Math.round(averageResponseTime),
        p95ResponseTime,
        p99ResponseTime,
        errorRate: Math.round(errorRate * 100) / 100,
        requestsPerMinute: Math.round((totalRequests / timeWindowMinutes) * 100) / 100,
        statusCodes
      };
    });

    return result;
  }

  /**
   * Obtém métricas por usuário
   */
  static getMetricsByUser(timeWindowMinutes: number = 5): { [userId: string]: PerformanceMetrics } {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime && metric.userId
    );

    const userMetrics: { [userId: string]: MetricsData[] } = {};
    
    // Agrupa métricas por usuário
    recentMetrics.forEach(metric => {
      if (!userMetrics[metric.userId!]) {
        userMetrics[metric.userId!] = [];
      }
      userMetrics[metric.userId!].push(metric);
    });

    // Calcula métricas para cada usuário
    const result: { [userId: string]: PerformanceMetrics } = {};
    
    Object.entries(userMetrics).forEach(([userId, metrics]) => {
      const responseTimes = metrics.map(m => m.responseTime).sort((a, b) => a - b);
      const totalRequests = metrics.length;
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
      
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p99Index = Math.floor(responseTimes.length * 0.99);
      const p95ResponseTime = responseTimes[p95Index] || 0;
      const p99ResponseTime = responseTimes[p99Index] || 0;

      const errorCount = metrics.filter(m => m.statusCode >= 400).length;
      const errorRate = (errorCount / totalRequests) * 100;

      const statusCodes: { [key: number]: number } = {};
      metrics.forEach(metric => {
        statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;
      });

      result[userId] = {
        totalRequests,
        averageResponseTime: Math.round(averageResponseTime),
        p95ResponseTime,
        p99ResponseTime,
        errorRate: Math.round(errorRate * 100) / 100,
        requestsPerMinute: Math.round((totalRequests / timeWindowMinutes) * 100) / 100,
        statusCodes
      };
    });

    return result;
  }

  /**
   * Limpa métricas antigas
   */
  static cleanupOldMetrics(maxAgeMinutes: number = 60): number {
    const cutoffTime = Date.now() - (maxAgeMinutes * 60 * 1000);
    const initialCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    );

    const removedCount = initialCount - this.metrics.length;
    
    if (removedCount > 0) {
      logger.info('Cleaned up old metrics', {
        removedCount,
        remainingCount: this.metrics.length,
        maxAgeMinutes
      });
    }

    return removedCount;
  }

  /**
   * Obtém estatísticas gerais
   */
  static getGeneralStats(): {
    totalMetrics: number;
    oldestMetric: string | null;
    newestMetric: string | null;
    uptime: number;
  } {
    const totalMetrics = this.metrics.length;
    const oldestMetric = totalMetrics > 0 ? this.metrics[0].timestamp : null;
    const newestMetric = totalMetrics > 0 ? this.metrics[totalMetrics - 1].timestamp : null;
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      totalMetrics,
      oldestMetric,
      newestMetric,
      uptime
    };
  }
}
