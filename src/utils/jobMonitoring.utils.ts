import { JobExecution, IJobExecution } from '@/models/JobExecution.model';
import { AlertingService } from '@/services/alerting.service';
import { logger } from '@/utils/logger';

export interface JobExecutionOptions {
  jobName: string;
  jobType: 'daily_metrics' | 'health_check' | 'data_validation' | 'cleanup' | 'custom';
  maxRetries?: number;
  timeout?: number; // em milissegundos
  metadata?: { [key: string]: any };
}

export interface JobExecutionContext {
  execution: IJobExecution;
  updateProgress: (progress: number) => Promise<void>;
  updateHeartbeat: () => Promise<void>;
  complete: (result?: any) => Promise<void>;
  fail: (error: Error | string) => Promise<void>;
  timeout: () => Promise<void>;
}

export class JobMonitoringUtils {
  private static alertingService = AlertingService.getInstance();
  private static runningJobs = new Map<string, NodeJS.Timeout>();

  /**
   * Executa um job com monitoramento completo
   */
  static async executeJob<T>(
    options: JobExecutionOptions,
    jobFunction: (context: JobExecutionContext) => Promise<T>
  ): Promise<T> {
    const execution = new JobExecution({
      jobName: options.jobName,
      jobType: options.jobType,
      status: 'pending',
      startTime: new Date(),
      maxRetries: options.maxRetries || 3,
      metadata: options.metadata || {}
    });

    await execution.save();

    logger.info('Job execution started', {
      jobName: options.jobName,
      jobType: options.jobType,
      executionId: execution._id
    });

    // Configura timeout se especificado
    let timeoutId: NodeJS.Timeout | undefined;
    if (options.timeout) {
      timeoutId = setTimeout(async () => {
        await this.handleJobTimeout(execution);
      }, options.timeout);
    }

    // Configura heartbeat
    const heartbeatInterval = setInterval(async () => {
      try {
        execution.updateHeartbeat();
      } catch (error) {
        logger.error('Failed to update heartbeat', { 
          executionId: execution._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 30000); // Heartbeat a cada 30 segundos

    try {
      // Marca como running
      execution.status = 'running';
      await execution.save();

      // Cria contexto para o job
      const context: JobExecutionContext = {
        execution,
        updateProgress: async (progress: number) => {
          execution.updateProgress(progress);
          await execution.save();
        },
        updateHeartbeat: async () => {
          execution.updateHeartbeat();
          await execution.save();
        },
        complete: async (result?: any) => {
          execution.complete(result);
          await execution.save();
        },
        fail: async (error: Error | string) => {
          execution.fail(error);
          await execution.save();
        },
        timeout: async () => {
          execution.timeout();
          await execution.save();
        }
      };

      // Executa o job
      const result = await jobFunction(context);

      // Job completado com sucesso
      execution.complete(result);
      await execution.save();

      // Limpa recursos
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(heartbeatInterval);

      logger.info('Job execution completed successfully', {
        jobName: options.jobName,
        executionId: execution._id,
        duration: execution.duration
      });

      return result;

    } catch (error) {
      // Job falhou
      execution.fail(error instanceof Error ? error : new Error(String(error)));
      await execution.save();

      // Limpa recursos
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(heartbeatInterval);

      logger.error('Job execution failed', {
        jobName: options.jobName,
        executionId: execution._id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Envia alerta de falha
      await this.alertingService.sendAlert(
        'data_validation',
        'critical',
        `Falha na Execução do Job: ${options.jobName}`,
        `O job ${options.jobName} falhou após ${execution.duration}ms. Erro: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          jobName: options.jobName,
          jobType: options.jobType,
          executionId: execution._id,
          duration: execution.duration,
          retryCount: execution.retryCount
        }
      );

      throw error;
    }
  }

  /**
   * Manipula timeout de job
   */
  private static async handleJobTimeout(execution: IJobExecution): Promise<void> {
    try {
      execution.timeout();
      await execution.save();

      logger.error('Job execution timeout', {
        jobName: execution.jobName,
        executionId: execution._id,
        duration: execution.duration
      });

      // Envia alerta de timeout
      await this.alertingService.sendAlert(
        'data_validation',
        'critical',
        `Timeout na Execução do Job: ${execution.jobName}`,
        `O job ${execution.jobName} excedeu o tempo limite de execução após ${execution.duration}ms`,
        {
          jobName: execution.jobName,
          jobType: execution.jobType,
          executionId: execution._id,
          duration: execution.duration
        }
      );
    } catch (error) {
      logger.error('Failed to handle job timeout', {
        executionId: execution._id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verifica jobs travados e os marca como timeout
   */
  static async checkStuckJobs(timeoutMinutes: number = 30): Promise<void> {
    try {
      const stuckJobs = await JobExecution.findStuckJobs(timeoutMinutes);
      
      if (stuckJobs.length > 0) {
        logger.warn('Found stuck jobs', { count: stuckJobs.length });

        for (const job of stuckJobs) {
          job.timeout();
          await job.save();

          // Envia alerta para cada job travado
          await this.alertingService.sendAlert(
            'data_validation',
            'critical',
            `Job Travado Detectado: ${job.jobName}`,
            `O job ${job.jobName} está travado há mais de ${timeoutMinutes} minutos. Último heartbeat: ${job.lastHeartbeat}`,
            {
              jobName: job.jobName,
              jobType: job.jobType,
              executionId: job._id,
              lastHeartbeat: job.lastHeartbeat,
              timeoutMinutes
            }
          );
        }
      }
    } catch (error) {
      logger.error('Failed to check stuck jobs', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém estatísticas de execução de jobs
   */
  static async getJobStatistics(jobName?: string, days: number = 30) {
    try {
      const stats = await JobExecution.getJobStatistics(jobName, days);
      return stats;
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
  static async getExecutionHistory(jobName?: string, limit: number = 50) {
    try {
      const history = await JobExecution.getRecentExecutions(jobName, limit);
      return history;
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
  static async getRunningJobs() {
    try {
      const runningJobs = await JobExecution.findRunningJobs();
      return runningJobs;
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
  static async cancelJob(executionId: string): Promise<boolean> {
    try {
      const execution = await JobExecution.findById(executionId);
      
      if (!execution) {
        return false;
      }

      if (execution.status !== 'running') {
        return false;
      }

      execution.status = 'cancelled';
      execution.endTime = new Date();
      await execution.save();

      logger.info('Job cancelled', {
        jobName: execution.jobName,
        executionId: execution._id
      });

      return true;
    } catch (error) {
      logger.error('Failed to cancel job', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Limpa execuções antigas
   */
  static async cleanupOldExecutions(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      
      const result = await JobExecution.deleteMany({
        startTime: { $lt: cutoffDate },
        status: { $in: ['completed', 'failed', 'timeout', 'cancelled'] }
      });

      logger.info('Cleaned up old job executions', {
        deletedCount: result.deletedCount,
        cutoffDate
      });

      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Failed to cleanup old executions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Inicia monitoramento periódico de jobs travados
   */
  static startStuckJobMonitoring(intervalMinutes: number = 5): void {
    const interval = setInterval(async () => {
      await this.checkStuckJobs();
    }, intervalMinutes * 60 * 1000);

    logger.info('Started stuck job monitoring', { intervalMinutes });
  }
}
