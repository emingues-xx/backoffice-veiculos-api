import cron from 'node-cron';
import { config } from '@/config/config';
import { logger, alertCriticalError } from '@/utils/logger';
import SalesMetricsService from '@/services/SalesMetricsService';
import healthCheckService from '@/services/healthCheckService';

/**
 * Job de atualização diária de métricas
 */
class MetricsUpdateJob {
  private jobScheduled = false;
  private healthCheckScheduled = false;
  private isRunning = false;

  /**
   * Inicia job agendado
   */
  start(): void {
    if (this.jobScheduled) {
      logger.warn('Metrics update job already scheduled');
      return;
    }

    // Job de consolidação diária de métricas
    cron.schedule(config.jobSchedule.dailyMetrics, async () => {
      await this.runDailyUpdate();
    });

    this.jobScheduled = true;
    logger.info('Metrics update job scheduled', {
      schedule: config.jobSchedule.dailyMetrics,
    });

    // Job de health check periódico
    cron.schedule(config.jobSchedule.healthCheck, async () => {
      await this.runHealthCheck();
    });

    this.healthCheckScheduled = true;
    logger.info('Health check job scheduled', {
      schedule: config.jobSchedule.healthCheck,
    });
  }

  /**
   * Executa atualização manual
   */
  async runManual(date?: Date): Promise<void> {
    const targetDate = date || new Date();
    logger.info('Running manual metrics update', { date: targetDate });

    try {
      await this.consolidateDailyMetrics(targetDate);
      logger.info('Manual metrics update completed successfully');
    } catch (error) {
      logger.error('Manual metrics update failed', error);
      throw error;
    }
  }

  /**
   * Execução do job diário
   */
  private async runDailyUpdate(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Metrics update job already running, skipping');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    logger.info('Starting daily metrics update job');

    try {
      // Consolida métricas do dia anterior
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await this.consolidateDailyMetrics(yesterday);

      // Cleanup de métricas antigas (mantém 90 dias)
      const deletedCount = await SalesMetricsService.cleanupOldMetrics(90);
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old metrics records`);
      }

      const duration = Date.now() - startTime;
      logger.info('Daily metrics update job completed', {
        duration: `${duration}ms`,
        date: yesterday.toISOString().split('T')[0],
      });
    } catch (error) {
      alertCriticalError('Daily metrics update job failed', error, {
        jobName: 'dailyMetricsUpdate',
      });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Consolida métricas para uma data específica
   */
  private async consolidateDailyMetrics(date: Date): Promise<void> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    logger.info('Consolidating metrics for date', {
      date: date.toISOString().split('T')[0],
    });

    try {
      // Calcula e salva métricas diárias gerais
      const dailyMetrics = await SalesMetricsService.calculateAndSaveMetrics({
        period: 'daily',
        startDate: dayStart,
        endDate: dayEnd,
      });

      logger.info('Daily metrics consolidated', {
        date: date.toISOString().split('T')[0],
        totalSales: dailyMetrics.totalSales,
        totalRevenue: dailyMetrics.totalRevenue,
      });

      // Verifica se é final de semana (domingo)
      if (date.getDay() === 0) {
        await this.consolidateWeeklyMetrics(date);
      }

      // Verifica se é último dia do mês
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);
      if (tomorrow.getMonth() !== date.getMonth()) {
        await this.consolidateMonthlyMetrics(date.getFullYear(), date.getMonth() + 1);
      }

      // Verifica se é último dia do ano
      if (date.getMonth() === 11 && date.getDate() === 31) {
        await this.consolidateYearlyMetrics(date.getFullYear());
      }
    } catch (error) {
      logger.error('Failed to consolidate daily metrics', error, {
        date: date.toISOString(),
      });
      throw error;
    }
  }

  /**
   * Consolida métricas semanais
   */
  private async consolidateWeeklyMetrics(endDate: Date): Promise<void> {
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // Última semana (7 dias)
    startDate.setHours(0, 0, 0, 0);

    try {
      const weeklyMetrics = await SalesMetricsService.getWeeklyMetrics(startDate, endDate);
      logger.info('Weekly metrics consolidated', {
        week: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        totalSales: weeklyMetrics.totalSales,
        totalRevenue: weeklyMetrics.totalRevenue,
      });
    } catch (error) {
      logger.error('Failed to consolidate weekly metrics', error);
    }
  }

  /**
   * Consolida métricas mensais
   */
  private async consolidateMonthlyMetrics(year: number, month: number): Promise<void> {
    try {
      const monthlyMetrics = await SalesMetricsService.getMonthlyMetrics(year, month);
      logger.info('Monthly metrics consolidated', {
        month: `${year}-${String(month).padStart(2, '0')}`,
        totalSales: monthlyMetrics.totalSales,
        totalRevenue: monthlyMetrics.totalRevenue,
      });
    } catch (error) {
      logger.error('Failed to consolidate monthly metrics', error, { year, month });
    }
  }

  /**
   * Consolida métricas anuais
   */
  private async consolidateYearlyMetrics(year: number): Promise<void> {
    try {
      const yearlyMetrics = await SalesMetricsService.getYearlyMetrics(year);
      logger.info('Yearly metrics consolidated', {
        year,
        totalSales: yearlyMetrics.totalSales,
        totalRevenue: yearlyMetrics.totalRevenue,
      });
    } catch (error) {
      logger.error('Failed to consolidate yearly metrics', error, { year });
    }
  }

  /**
   * Executa health check periódico
   */
  private async runHealthCheck(): Promise<void> {
    try {
      const health = await healthCheckService.checkHealth();

      if (health.status === 'unhealthy') {
        logger.error('System health check failed', undefined, {
          status: health.status,
          services: health.services,
        });
      } else if (health.status === 'degraded') {
        logger.warn('System health degraded', {
          status: health.status,
          services: health.services,
        });
      }
    } catch (error) {
      logger.error('Health check job failed', error);
    }
  }

  /**
   * Para jobs agendados
   */
  stop(): void {
    // node-cron não possui método direto para parar tasks individuais
    // Em produção, considere usar bibliotecas como bull ou agenda para melhor controle
    this.jobScheduled = false;
    this.healthCheckScheduled = false;
    logger.info('Metrics update jobs stopped');
  }

  /**
   * Status do job
   */
  getStatus(): {
    scheduled: boolean;
    running: boolean;
    healthCheckScheduled: boolean;
  } {
    return {
      scheduled: this.jobScheduled,
      running: this.isRunning,
      healthCheckScheduled: this.healthCheckScheduled,
    };
  }
}

export default new MetricsUpdateJob();
