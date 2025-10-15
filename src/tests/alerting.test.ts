import { AlertingService } from '../services/alerting.service';
import { AlertingUtils } from '../utils/alerting.utils';
import { alertingConfig, AlertLevel, AlertType } from '../config/alerting.config';

// Mock axios para evitar chamadas reais de webhook
jest.mock('axios');
const axios = require('axios');

describe('AlertingService', () => {
  let alertingService: AlertingService;

  beforeEach(() => {
    alertingService = AlertingService.getInstance();
    jest.clearAllMocks();
  });

  describe('sendAlert', () => {
    it('should create and record alert when alerting is enabled', async () => {
      // Mock da configuração
      jest.spyOn(alertingConfig, 'enabled', 'get').mockReturnValue(true);
      jest.spyOn(alertingConfig.webhooks, 'slack', 'get').mockReturnValue(undefined);
      jest.spyOn(alertingConfig.webhooks, 'discord', 'get').mockReturnValue(undefined);

      const result = await alertingService.sendAlert(
        'response_time',
        'warning',
        'Test Alert',
        'This is a test alert',
        { test: true }
      );

      expect(result).toBe(false); // Sem webhooks configurados
    });

    it('should not send alert when alerting is disabled', async () => {
      jest.spyOn(alertingConfig, 'enabled', 'get').mockReturnValue(false);

      const result = await alertingService.sendAlert(
        'response_time',
        'warning',
        'Test Alert',
        'This is a test alert'
      );

      expect(result).toBe(false);
    });

    it('should send alert to Slack when configured', async () => {
      jest.spyOn(alertingConfig, 'enabled', 'get').mockReturnValue(true);
      jest.spyOn(alertingConfig.webhooks, 'slack', 'get').mockReturnValue({
        url: 'https://hooks.slack.com/test',
        channel: '#test',
        username: 'Test Bot'
      });
      jest.spyOn(alertingConfig.webhooks, 'discord', 'get').mockReturnValue(undefined);

      axios.post.mockResolvedValue({ status: 200 });

      const result = await alertingService.sendAlert(
        'response_time',
        'warning',
        'Test Alert',
        'This is a test alert'
      );

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          username: 'Backoffice API Bot',
          attachments: expect.any(Array)
        }),
        expect.any(Object)
      );
    });

    it('should send alert to Discord when configured', async () => {
      jest.spyOn(alertingConfig, 'enabled', 'get').mockReturnValue(true);
      jest.spyOn(alertingConfig.webhooks, 'slack', 'get').mockReturnValue(undefined);
      jest.spyOn(alertingConfig.webhooks, 'discord', 'get').mockReturnValue({
        url: 'https://discord.com/api/webhooks/test',
        username: 'Test Bot'
      });

      axios.post.mockResolvedValue({ status: 200 });

      const result = await alertingService.sendAlert(
        'response_time',
        'warning',
        'Test Alert',
        'This is a test alert'
      );

      expect(result).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          username: 'Backoffice API Bot',
          embeds: expect.any(Array)
        }),
        expect.any(Object)
      );
    });
  });

  describe('checkMetrics', () => {
    beforeEach(() => {
      jest.spyOn(alertingConfig, 'enabled', 'get').mockReturnValue(true);
      jest.spyOn(alertingConfig.webhooks, 'slack', 'get').mockReturnValue(undefined);
      jest.spyOn(alertingConfig.webhooks, 'discord', 'get').mockReturnValue(undefined);
    });

    it('should send critical alert for high response time', async () => {
      const sendAlertSpy = jest.spyOn(alertingService, 'sendAlert').mockResolvedValue(true);
      jest.spyOn(alertingConfig.thresholds.responseTime, 'critical', 'get').mockReturnValue(1000);

      await alertingService.checkMetrics({
        responseTime: 1500
      });

      expect(sendAlertSpy).toHaveBeenCalledWith(
        'response_time',
        'critical',
        'Tempo de Resposta Crítico',
        expect.stringContaining('1500ms'),
        expect.objectContaining({
          responseTime: 1500,
          threshold: 1000
        })
      );
    });

    it('should send warning alert for moderate response time', async () => {
      const sendAlertSpy = jest.spyOn(alertingService, 'sendAlert').mockResolvedValue(true);
      jest.spyOn(alertingConfig.thresholds.responseTime, 'warning', 'get').mockReturnValue(500);
      jest.spyOn(alertingConfig.thresholds.responseTime, 'critical', 'get').mockReturnValue(1000);

      await alertingService.checkMetrics({
        responseTime: 750
      });

      expect(sendAlertSpy).toHaveBeenCalledWith(
        'response_time',
        'warning',
        'Tempo de Resposta Alto',
        expect.stringContaining('750ms'),
        expect.objectContaining({
          responseTime: 750,
          threshold: 500
        })
      );
    });

    it('should send critical alert for high error rate', async () => {
      const sendAlertSpy = jest.spyOn(alertingService, 'sendAlert').mockResolvedValue(true);
      jest.spyOn(alertingConfig.thresholds.errorRate, 'critical', 'get').mockReturnValue(5.0);

      await alertingService.checkMetrics({
        errorRate: 7.5
      });

      expect(sendAlertSpy).toHaveBeenCalledWith(
        'error_rate',
        'critical',
        'Taxa de Erro Crítica',
        expect.stringContaining('7.50%'),
        expect.objectContaining({
          errorRate: 7.5,
          threshold: 5.0
        })
      );
    });

    it('should send critical alert for database disconnection', async () => {
      const sendAlertSpy = jest.spyOn(alertingService, 'sendAlert').mockResolvedValue(true);

      await alertingService.checkMetrics({
        databaseStatus: 'disconnected'
      });

      expect(sendAlertSpy).toHaveBeenCalledWith(
        'database_connection',
        'critical',
        'Falha na Conexão com o Banco',
        expect.stringContaining('disconnected'),
        expect.objectContaining({
          databaseStatus: 'disconnected'
        })
      );
    });
  });

  describe('testWebhooks', () => {
    it('should test webhook connectivity', async () => {
      jest.spyOn(alertingConfig.webhooks, 'slack', 'get').mockReturnValue({
        url: 'https://hooks.slack.com/test',
        channel: '#test',
        username: 'Test Bot'
      });
      jest.spyOn(alertingConfig.webhooks, 'discord', 'get').mockReturnValue({
        url: 'https://discord.com/api/webhooks/test',
        username: 'Test Bot'
      });

      axios.post.mockResolvedValue({ status: 200 });

      const result = await alertingService.testWebhooks();

      expect(result).toEqual({
        slack: true,
        discord: true
      });
    });
  });
});

describe('AlertingUtils', () => {
  beforeEach(() => {
    // Limpa histórico de alertas
    (AlertingUtils as any).alertHistory.clear();
    (AlertingUtils as any).lastAlertTimes.clear();
  });

  describe('createAlert', () => {
    it('should create alert with correct structure', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message',
        { test: true }
      );

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type', 'response_time');
      expect(alert).toHaveProperty('level', 'warning');
      expect(alert).toHaveProperty('title', 'Test Alert');
      expect(alert).toHaveProperty('message', 'Test message');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('metadata', { test: true });
    });
  });

  describe('shouldSendAlert', () => {
    it('should allow alert when no previous alerts exist', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message'
      );

      const shouldSend = AlertingUtils.shouldSendAlert(alert, 300000, 3);
      expect(shouldSend).toBe(true);
    });

    it('should respect grace period', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message'
      );

      // Registra primeiro alerta
      AlertingUtils.recordAlert(alert);

      // Segundo alerta dentro do período de graça
      const shouldSend = AlertingUtils.shouldSendAlert(alert, 300000, 3);
      expect(shouldSend).toBe(true); // Ainda dentro do limite de 3 alertas
    });

    it('should block alert when max alerts per period exceeded', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message'
      );

      // Registra 3 alertas (limite)
      for (let i = 0; i < 3; i++) {
        AlertingUtils.recordAlert(alert);
      }

      // Quarto alerta deve ser bloqueado
      const shouldSend = AlertingUtils.shouldSendAlert(alert, 300000, 3);
      expect(shouldSend).toBe(false);
    });
  });

  describe('formatSlackMessage', () => {
    it('should format alert for Slack', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message'
      );

      const message = AlertingUtils.formatSlackMessage(alert);

      expect(message).toHaveProperty('username', 'Backoffice API Bot');
      expect(message).toHaveProperty('attachments');
      expect(message.attachments[0]).toHaveProperty('title');
      expect(message.attachments[0]).toHaveProperty('text');
      expect(message.attachments[0]).toHaveProperty('fields');
    });
  });

  describe('formatDiscordMessage', () => {
    it('should format alert for Discord', () => {
      const alert = AlertingUtils.createAlert(
        'response_time',
        'warning',
        'Test Alert',
        'Test message'
      );

      const message = AlertingUtils.formatDiscordMessage(alert);

      expect(message).toHaveProperty('username', 'Backoffice API Bot');
      expect(message).toHaveProperty('embeds');
      expect(message.embeds[0]).toHaveProperty('title');
      expect(message.embeds[0]).toHaveProperty('description');
      expect(message.embeds[0]).toHaveProperty('fields');
    });
  });

  describe('getAlertStatistics', () => {
    it('should return alert statistics', () => {
      const alert1 = AlertingUtils.createAlert('response_time', 'warning', 'Test 1', 'Message 1');
      const alert2 = AlertingUtils.createAlert('error_rate', 'critical', 'Test 2', 'Message 2');
      const alert3 = AlertingUtils.createAlert('response_time', 'warning', 'Test 3', 'Message 3');

      AlertingUtils.recordAlert(alert1);
      AlertingUtils.recordAlert(alert2);
      AlertingUtils.recordAlert(alert3);

      const stats = AlertingUtils.getAlertStatistics();

      expect(stats.totalAlerts).toBe(3);
      expect(stats.alertsByType.response_time).toBe(2);
      expect(stats.alertsByType.error_rate).toBe(1);
      expect(stats.alertsByLevel.warning).toBe(2);
      expect(stats.alertsByLevel.critical).toBe(1);
    });
  });
});
