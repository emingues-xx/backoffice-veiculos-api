import { JobExecution, IJobExecution } from '@/models/JobExecution.model';
import { JobMonitoringUtils, JobExecutionOptions, JobExecutionContext } from '@/utils/jobMonitoring.utils';
import { AlertingService } from '@/services/alerting.service';
import { logger } from '@/utils/logger';

export interface JobStatistics {
  jobName: string;
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  lastExecution?: Date;
  statuses: {
    [status: string]: {
      count: number;
      avgDuration?: number;
      maxDuration?: number;
      minDuration?: number;
    };
  };
}

export interface JobExecutionSummary {
  _id: string;
  jobName: string;
  jobType: string;
  status: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  error?: {
    message: string;
    code?: string;
  };
}

export class JobMonitoringService {
  private static instance: JobMonitoringService;
  private alertingService = AlertingService.getInstance();
  private isMonitoring = false;

  private constructor() {}

  static getInstance(): JobMonitoringService {
    if (!JobMonitoringService.instance) {
      JobMonitoringService.instance = new JobMonitoringService();
    }
    return JobMonitoringService.instance;
  }

  /**
   * Executa um job com monitoramento completo
   */
  async executeJob<T>(
    options: JobExecutionOptions,
    jobFunction: (context: JobExecutionContext) => Promise<T>
  ): Promise<T> {
    return JobMonitoringUtils.executeJob(options, jobFunction);
  }

  /**
   * Obtém estatísticas de execução de jobs
   */
  async getJobStatistics(jobName?: string, days: number = 30): Promise<JobStatistics[]> {
    try {
      const rawStats = await JobMonitoringUtils.getJobStatistics(jobName, days);
      
      const statistics: JobStatistics[] = rawStats.map(stat => {
        const totalExecutions = stat.statuses.reduce((sum, s) => sum + s.count, 0);
        const completedCount = stat.statuses.find(s => s.status === 'completed')?.count || 0;
        const successRate = totalExecutions > 0 ? (completedCount / totalExecutions) * 100 : 0;
        
        const statusesMap: { [key: string]: any } = {};
        stat.statuses.forEach(s => {
          statusesMap[s.status] = {
            count: s.count,
            avgDuration: s.avgDuration,
            maxDuration: s.maxDuration,
            minDuration: s.minDuration
          };
        });

        return {
          jobName: stat._id,
          totalExecutions,
          successRate: Math.round(successRate * 100) / 100,
          averageDuration: Math.round(
            stat.statuses.reduce((sum, s) => sum + (s.avgDuration || 0), 0) / stat.statuses.length
          ),
          statuses: statusesMap
        };
      });

      return statistics;
    } catch (error) {
      logger.error('Failed to get job statistics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Obtém histórico de execuções
   */
  async getExecutionHistory(
    jobName?: string, 
    limit: number = 50,
    status?: string
  ): Promise<JobExecutionSummary[]> {
    try {
      let query: any = {};
      if (jobName) query.jobName = jobName;
      if (status) query.status = status;

      const executions = await JobExecution.find(query)
        .sort({ startTime: -1 })
        .limit(limit)
        .select('-error.stack -metadata -result'); // Exclui campos pesados

      return executions.map(exec => ({
        _id: exec._id.toString(),
        jobName: exec.jobName,
        jobType: exec.jobType,
        status: exec.status,
        startTime: exec.startTime,
        endTime: exec.endTime,
        duration: exec.duration,
        progress: exec.progress,
        error: exec.error ? {
          message: exec.error.message,
          code: exec.error.code
        } : undefined
      }));
    } catch (error) {
      logger.error('Failed to get execution history', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Obtém jobs em execução
   */
  async getRunningJobs(): Promise<JobExecutionSummary[]> {
    try {
      const runningJobs = await JobMonitoringUtils.getRunningJobs();
      
      return runningJobs.map(job => ({
        _id: job._id.toString(),
        jobName: job.jobName,
        jobType: job.jobType,
        status: job.status,
        startTime: job.startTime,
        endTime: job.endTime,
        duration: job.duration,
        progress: job.progress,
        error: job.error ? {
          message: job.error.message,
          code: job.error.code
        } : undefined
      }));
    } catch (error) {
      logger.error('Failed to get running jobs', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Cancela um job em execução
   */
  async cancelJob(executionId: string): Promise<boolean> {
    try {
      const success = await JobMonitoringUtils.cancelJob(executionId);
      
      if (success) {
        logger.info('Job cancelled successfully', { executionId });
      } else {
        logger.warn('Failed to cancel job', { executionId });
      }

      return success;
    } catch (error) {
      logger.error('Failed to cancel job', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Obtém detalhes de uma execução específica
   */
  async getExecutionDetails(executionId: string): Promise<IJobExecution | null> {
    try {
      const execution = await JobExecution.findById(executionId);
      return execution;
    } catch (error) {
      logger.error('Failed to get execution details', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Obtém métricas de performance dos jobs
   */
  async getPerformanceMetrics(jobName?: string, days: number = 7): Promise<{
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    throughput: number; // jobs por hora
  }> {
    try {
      const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const matchQuery: any = { 
        startTime: { $gte: startDate },
        duration: { $exists: true, $ne: null }
      };
      
      if (jobName) {
        matchQuery.jobName = jobName;
      }

      const metrics = await JobExecution.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            p95Duration: { $percentile: { input: '$duration', p: [0.95] } },
            p99Duration: { $percentile: { input: '$duration', p: [0.99] } },
            totalJobs: { $sum: 1 },
            failedJobs: {
              $sum: {
                $cond: [{ $in: ['$status', ['failed', 'timeout']] }, 1, 0]
              }
            }
          }
        }
      ]);

      if (metrics.length === 0) {
        return {
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          errorRate: 0,
          throughput: 0
        };
      }

      const metric = metrics[0];
      const totalHours = days * 24;
      const errorRate = metric.totalJobs > 0 ? (metric.failedJobs / metric.totalJobs) * 100 : 0;

      return {
        averageResponseTime: Math.round(metric.avgDuration || 0),
        p95ResponseTime: Math.round(metric.p95Duration?.[0] || 0),
        p99ResponseTime: Math.round(metric.p99Duration?.[0] || 0),
        errorRate: Math.round(errorRate * 100) / 100,
        throughput: Math.round((metric.totalJobs / totalHours) * 100) / 100
      };
    } catch (error) {
      logger.error('Failed to get performance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Inicia monitoramento automático de jobs travados
   */
  startMonitoring(intervalMinutes: number = 5): void {
    if (this.isMonitoring) {
      logger.warn('Job monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    JobMonitoringUtils.startStuckJobMonitoring(intervalMinutes);
    
    logger.info('Job monitoring started', { intervalMinutes });
  }

  /**
   * Para o monitoramento automático
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    logger.info('Job monitoring stopped');
  }

  /**
   * Limpa execuções antigas
   */
  async cleanupOldExecutions(daysToKeep: number = 30): Promise<number> {
    try {
      const deletedCount = await JobMonitoringUtils.cleanupOldExecutions(daysToKeep);
      
      logger.info('Cleaned up old job executions', {
        deletedCount,
        daysToKeep
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old executions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Obtém status do serviço de monitoramento
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    uptime: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      uptime: process.uptime()
    };
  }
}
