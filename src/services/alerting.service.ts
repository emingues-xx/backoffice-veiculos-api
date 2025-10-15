import axios, { AxiosResponse } from 'axios';
import { alertingConfig, Alert, AlertLevel, AlertType } from '@/config/alerting.config';
import { AlertingUtils } from '@/utils/alerting.utils';
import { logger } from '@/utils/logger';

export class AlertingService {
  private static instance: AlertingService;
  private isProcessing = false;

  private constructor() {}

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService();
    }
    return AlertingService.instance;
  }

  /**
   * Envia um alerta se as condições forem atendidas
   */
  async sendAlert(
    type: AlertType,
    level: AlertLevel,
    title: string,
    message: string,
    metadata: { [key: string]: any } = {}
  ): Promise<boolean> {
    if (!alertingConfig.enabled) {
      logger.debug('Alerting is disabled, skipping alert', { type, level, title });
      return false;
    }

    const alert = AlertingUtils.createAlert(type, level, title, message, metadata);

    // Verifica debouncing
    if (alertingConfig.debouncing.enabled) {
      const shouldSend = AlertingUtils.shouldSendAlert(
        alert,
        alertingConfig.debouncing.gracePeriod,
        alertingConfig.debouncing.maxAlertsPerPeriod
      );

      if (!shouldSend) {
        logger.debug('Alert suppressed due to debouncing', { 
          type, 
          level, 
          gracePeriod: alertingConfig.debouncing.gracePeriod 
        });
        return false;
      }
    }

    // Registra o alerta
    AlertingUtils.recordAlert(alert);

    // Envia para webhooks configurados
    const results = await Promise.allSettled([
      this.sendToSlack(alert),
      this.sendToDiscord(alert)
    ]);

    const success = results.some(result => result.status === 'fulfilled');
    
    if (success) {
      logger.info('Alert sent successfully', { 
        type, 
        level, 
        title,
        webhooks: results.map(r => r.status)
      });
    } else {
      logger.error('Failed to send alert to any webhook', { 
        type, 
        level, 
        title,
        errors: results.map(r => r.status === 'rejected' ? r.reason : null)
      });
    }

    return success;
  }

  /**
   * Envia alerta para Slack
   */
  private async sendToSlack(alert: Alert): Promise<boolean> {
    if (!alertingConfig.webhooks.slack?.url) {
      return false;
    }

    try {
      const message = AlertingUtils.formatSlackMessage(alert);
      
      const response: AxiosResponse = await axios.post(
        alertingConfig.webhooks.slack.url,
        message,
        {
          timeout: alertingConfig.notification.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        logger.debug('Alert sent to Slack successfully', { alertId: alert.id });
        return true;
      } else {
        logger.warn('Slack webhook returned non-success status', { 
          status: response.status,
          alertId: alert.id 
        });
        return false;
      }
    } catch (error) {
      logger.error('Failed to send alert to Slack', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        alertId: alert.id 
      });
      return false;
    }
  }

  /**
   * Envia alerta para Discord
   */
  private async sendToDiscord(alert: Alert): Promise<boolean> {
    if (!alertingConfig.webhooks.discord?.url) {
      return false;
    }

    try {
      const message = AlertingUtils.formatDiscordMessage(alert);
      
      const response: AxiosResponse = await axios.post(
        alertingConfig.webhooks.discord.url,
        message,
        {
          timeout: alertingConfig.notification.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        logger.debug('Alert sent to Discord successfully', { alertId: alert.id });
        return true;
      } else {
        logger.warn('Discord webhook returned non-success status', { 
          status: response.status,
          alertId: alert.id 
        });
        return false;
      }
    } catch (error) {
      logger.error('Failed to send alert to Discord', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        alertId: alert.id 
      });
      return false;
    }
  }

  /**
   * Verifica métricas e envia alertas se necessário
   */
  async checkMetrics(metrics: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
    databaseStatus?: 'connected' | 'disconnected' | 'error';
  }): Promise<void> {
    if (this.isProcessing) {
      return; // Evita processamento concorrente
    }

    this.isProcessing = true;

    try {
      const alerts: Promise<boolean>[] = [];

      // Verifica tempo de resposta
      if (metrics.responseTime !== undefined) {
        if (metrics.responseTime >= alertingConfig.thresholds.responseTime.critical) {
          alerts.push(this.sendAlert(
            'response_time',
            'critical',
            'Tempo de Resposta Crítico',
            `Tempo de resposta da API está em ${metrics.responseTime}ms, acima do limite crítico de ${alertingConfig.thresholds.responseTime.critical}ms`,
            { responseTime: metrics.responseTime, threshold: alertingConfig.thresholds.responseTime.critical }
          ));
        } else if (metrics.responseTime >= alertingConfig.thresholds.responseTime.warning) {
          alerts.push(this.sendAlert(
            'response_time',
            'warning',
            'Tempo de Resposta Alto',
            `Tempo de resposta da API está em ${metrics.responseTime}ms, acima do limite de aviso de ${alertingConfig.thresholds.responseTime.warning}ms`,
            { responseTime: metrics.responseTime, threshold: alertingConfig.thresholds.responseTime.warning }
          ));
        }
      }

      // Verifica taxa de erro
      if (metrics.errorRate !== undefined) {
        if (metrics.errorRate >= alertingConfig.thresholds.errorRate.critical) {
          alerts.push(this.sendAlert(
            'error_rate',
            'critical',
            'Taxa de Erro Crítica',
            `Taxa de erro está em ${metrics.errorRate.toFixed(2)}%, acima do limite crítico de ${alertingConfig.thresholds.errorRate.critical}%`,
            { errorRate: metrics.errorRate, threshold: alertingConfig.thresholds.errorRate.critical }
          ));
        } else if (metrics.errorRate >= alertingConfig.thresholds.errorRate.warning) {
          alerts.push(this.sendAlert(
            'error_rate',
            'warning',
            'Taxa de Erro Alta',
            `Taxa de erro está em ${metrics.errorRate.toFixed(2)}%, acima do limite de aviso de ${alertingConfig.thresholds.errorRate.warning}%`,
            { errorRate: metrics.errorRate, threshold: alertingConfig.thresholds.errorRate.warning }
          ));
        }
      }

      // Verifica uso de memória
      if (metrics.memoryUsage !== undefined) {
        if (metrics.memoryUsage >= alertingConfig.thresholds.memoryUsage.critical) {
          alerts.push(this.sendAlert(
            'memory_usage',
            'critical',
            'Uso de Memória Crítico',
            `Uso de memória está em ${metrics.memoryUsage.toFixed(2)}%, acima do limite crítico de ${alertingConfig.thresholds.memoryUsage.critical}%`,
            { memoryUsage: metrics.memoryUsage, threshold: alertingConfig.thresholds.memoryUsage.critical }
          ));
        } else if (metrics.memoryUsage >= alertingConfig.thresholds.memoryUsage.warning) {
          alerts.push(this.sendAlert(
            'memory_usage',
            'warning',
            'Uso de Memória Alto',
            `Uso de memória está em ${metrics.memoryUsage.toFixed(2)}%, acima do limite de aviso de ${alertingConfig.thresholds.memoryUsage.warning}%`,
            { memoryUsage: metrics.memoryUsage, threshold: alertingConfig.thresholds.memoryUsage.warning }
          ));
        }
      }

      // Verifica status do banco de dados
      if (metrics.databaseStatus && metrics.databaseStatus !== 'connected') {
        alerts.push(this.sendAlert(
          'database_connection',
          'critical',
          'Falha na Conexão com o Banco',
          `Conexão com o banco de dados está com status: ${metrics.databaseStatus}`,
          { databaseStatus: metrics.databaseStatus }
        ));
      }

      // Aguarda todos os alertas serem processados
      await Promise.allSettled(alerts);

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Obtém estatísticas de alertas
   */
  getAlertStatistics() {
    return AlertingUtils.getAlertStatistics();
  }

  /**
   * Limpa alertas antigos
   */
  cleanupOldAlerts(maxAge?: number): void {
    AlertingUtils.cleanupOldAlerts(maxAge);
  }

  /**
   * Testa conectividade com webhooks
   */
  async testWebhooks(): Promise<{
    slack: boolean;
    discord: boolean;
  }> {
    const testAlert = AlertingUtils.createAlert(
      'data_validation',
      'info',
      'Teste de Conectividade',
      'Este é um teste de conectividade dos webhooks de alerta',
      { test: true }
    );

    const results = await Promise.allSettled([
      this.sendToSlack(testAlert),
      this.sendToDiscord(testAlert)
    ]);

    return {
      slack: results[0].status === 'fulfilled' && results[0].value,
      discord: results[1].status === 'fulfilled' && results[1].value
    };
  }
}
