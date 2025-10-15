import { Request, Response } from 'express';
import { JobMonitoringService } from '@/services/jobMonitoring.service';
import { logger } from '@/utils/logger';

export class JobMonitoringController {
  private static jobMonitoringService = JobMonitoringService.getInstance();

  /**
   * Obtém estatísticas de execução de jobs
   */
  static async getJobStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { jobName, days = 30 } = req.query;
      
      const statistics = await this.jobMonitoringService.getJobStatistics(
        jobName as string,
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: {
          statistics,
          filters: {
            jobName: jobName || 'all',
            days: parseInt(days as string)
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get job statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get job statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém histórico de execuções
   */
  static async getExecutionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { jobName, limit = 50, status } = req.query;
      
      const history = await this.jobMonitoringService.getExecutionHistory(
        jobName as string,
        parseInt(limit as string),
        status as string
      );

      res.json({
        success: true,
        data: {
          history,
          filters: {
            jobName: jobName || 'all',
            limit: parseInt(limit as string),
            status: status || 'all'
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get execution history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get execution history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém jobs em execução
   */
  static async getRunningJobs(req: Request, res: Response): Promise<void> {
    try {
      const runningJobs = await this.jobMonitoringService.getRunningJobs();

      res.json({
        success: true,
        data: {
          runningJobs,
          count: runningJobs.length
        }
      });
    } catch (error) {
      logger.error('Failed to get running jobs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get running jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cancela um job em execução
   */
  static async cancelJob(req: Request, res: Response): Promise<void> {
    try {
      const { executionId } = req.params;
      
      const success = await this.jobMonitoringService.cancelJob(executionId);

      if (success) {
        res.json({
          success: true,
          message: 'Job cancelled successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Job not found or not running'
        });
      }
    } catch (error) {
      logger.error('Failed to cancel job', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: req.params.executionId,
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to cancel job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém detalhes de uma execução específica
   */
  static async getExecutionDetails(req: Request, res: Response): Promise<void> {
    try {
      const { executionId } = req.params;
      
      const execution = await this.jobMonitoringService.getExecutionDetails(executionId);

      if (execution) {
        res.json({
          success: true,
          data: execution
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Execution not found'
        });
      }
    } catch (error) {
      logger.error('Failed to get execution details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: req.params.executionId,
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get execution details',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém métricas de performance dos jobs
   */
  static async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { jobName, days = 7 } = req.query;
      
      const metrics = await this.jobMonitoringService.getPerformanceMetrics(
        jobName as string,
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: {
          metrics,
          filters: {
            jobName: jobName || 'all',
            days: parseInt(days as string)
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get performance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtém status do serviço de monitoramento
   */
  static async getMonitoringStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.jobMonitoringService.getMonitoringStatus();

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Failed to get monitoring status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get monitoring status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Inicia monitoramento automático
   */
  static async startMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { intervalMinutes = 5 } = req.body;
      
      this.jobMonitoringService.startMonitoring(intervalMinutes);

      res.json({
        success: true,
        message: 'Monitoring started successfully',
        data: {
          intervalMinutes
        }
      });
    } catch (error) {
      logger.error('Failed to start monitoring', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to start monitoring',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Para monitoramento automático
   */
  static async stopMonitoring(req: Request, res: Response): Promise<void> {
    try {
      this.jobMonitoringService.stopMonitoring();

      res.json({
        success: true,
        message: 'Monitoring stopped successfully'
      });
    } catch (error) {
      logger.error('Failed to stop monitoring', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to stop monitoring',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Limpa execuções antigas
   */
  static async cleanupOldExecutions(req: Request, res: Response): Promise<void> {
    try {
      const { daysToKeep = 30 } = req.body;
      
      const deletedCount = await this.jobMonitoringService.cleanupOldExecutions(daysToKeep);

      res.json({
        success: true,
        message: 'Old executions cleaned up successfully',
        data: {
          deletedCount,
          daysToKeep
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup old executions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: (req as any).requestId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to cleanup old executions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
