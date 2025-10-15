import { Alert, AlertLevel, AlertType } from '@/config/alerting.config';
import { v4 as uuidv4 } from 'uuid';

export class AlertingUtils {
  private static alertHistory: Map<string, Alert[]> = new Map();
  private static lastAlertTimes: Map<string, number> = new Map();

  /**
   * Cria um novo alerta
   */
  static createAlert(
    type: AlertType,
    level: AlertLevel,
    title: string,
    message: string,
    metadata: { [key: string]: any } = {}
  ): Alert {
    return {
      id: uuidv4(),
      type,
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
  }

  /**
   * Verifica se um alerta deve ser enviado (debouncing)
   */
  static shouldSendAlert(
    alert: Alert,
    gracePeriod: number,
    maxAlertsPerPeriod: number
  ): boolean {
    const alertKey = `${alert.type}_${alert.level}`;
    const now = Date.now();
    const lastAlertTime = this.lastAlertTimes.get(alertKey) || 0;
    
    // Verifica se ainda está no período de graça
    if (now - lastAlertTime < gracePeriod) {
      // Verifica se já excedeu o limite de alertas no período
      const recentAlerts = this.getRecentAlerts(alertKey, gracePeriod);
      if (recentAlerts.length >= maxAlertsPerPeriod) {
        return false;
      }
    }

    return true;
  }

  /**
   * Registra um alerta no histórico
   */
  static recordAlert(alert: Alert): void {
    const alertKey = `${alert.type}_${alert.level}`;
    
    if (!this.alertHistory.has(alertKey)) {
      this.alertHistory.set(alertKey, []);
    }
    
    this.alertHistory.get(alertKey)!.push(alert);
    this.lastAlertTimes.set(alertKey, Date.now());
    
    // Limpa alertas antigos (mantém apenas os últimos 100)
    const alerts = this.alertHistory.get(alertKey)!;
    if (alerts.length > 100) {
      alerts.splice(0, alerts.length - 100);
    }
  }

  /**
   * Obtém alertas recentes para um tipo específico
   */
  static getRecentAlerts(alertKey: string, timeWindow: number): Alert[] {
    const alerts = this.alertHistory.get(alertKey) || [];
    const cutoffTime = Date.now() - timeWindow;
    
    return alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Formata alerta para Slack
   */
  static formatSlackMessage(alert: Alert): any {
    const color = this.getSlackColor(alert.level);
    const emoji = this.getSlackEmoji(alert.level);
    
    return {
      username: 'Backoffice API Bot',
      icon_emoji: ':warning:',
      attachments: [
        {
          color,
          title: `${emoji} ${alert.title}`,
          text: alert.message,
          fields: [
            {
              title: 'Tipo',
              value: alert.type,
              short: true
            },
            {
              title: 'Nível',
              value: alert.level.toUpperCase(),
              short: true
            },
            {
              title: 'Timestamp',
              value: new Date(alert.timestamp).toLocaleString('pt-BR'),
              short: true
            }
          ],
          footer: 'Backoffice Veículos API',
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
        }
      ]
    };
  }

  /**
   * Formata alerta para Discord
   */
  static formatDiscordMessage(alert: Alert): any {
    const color = this.getDiscordColor(alert.level);
    const emoji = this.getDiscordEmoji(alert.level);
    
    return {
      username: 'Backoffice API Bot',
      embeds: [
        {
          title: `${emoji} ${alert.title}`,
          description: alert.message,
          color,
          fields: [
            {
              name: 'Tipo',
              value: alert.type,
              inline: true
            },
            {
              name: 'Nível',
              value: alert.level.toUpperCase(),
              inline: true
            },
            {
              name: 'Timestamp',
              value: new Date(alert.timestamp).toLocaleString('pt-BR'),
              inline: true
            }
          ],
          footer: {
            text: 'Backoffice Veículos API'
          },
          timestamp: alert.timestamp
        }
      ]
    };
  }

  /**
   * Obtém cor para Slack baseada no nível do alerta
   */
  private static getSlackColor(level: AlertLevel): string {
    switch (level) {
      case 'info': return '#36a64f';
      case 'warning': return '#ff9500';
      case 'critical': return '#ff0000';
      default: return '#36a64f';
    }
  }

  /**
   * Obtém emoji para Slack baseado no nível do alerta
   */
  private static getSlackEmoji(level: AlertLevel): string {
    switch (level) {
      case 'info': return ':information_source:';
      case 'warning': return ':warning:';
      case 'critical': return ':rotating_light:';
      default: return ':information_source:';
    }
  }

  /**
   * Obtém cor para Discord baseada no nível do alerta
   */
  private static getDiscordColor(level: AlertLevel): number {
    switch (level) {
      case 'info': return 0x36a64f;
      case 'warning': return 0xff9500;
      case 'critical': return 0xff0000;
      default: return 0x36a64f;
    }
  }

  /**
   * Obtém emoji para Discord baseado no nível do alerta
   */
  private static getDiscordEmoji(level: AlertLevel): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return 'ℹ️';
    }
  }

  /**
   * Gera estatísticas de alertas
   */
  static getAlertStatistics(): {
    totalAlerts: number;
    alertsByType: { [key: string]: number };
    alertsByLevel: { [key: string]: number };
    recentAlerts: Alert[];
  } {
    const allAlerts: Alert[] = [];
    const alertsByType: { [key: string]: number } = {};
    const alertsByLevel: { [key: string]: number } = {};

    // Coleta todos os alertas
    for (const alerts of this.alertHistory.values()) {
      allAlerts.push(...alerts);
    }

    // Conta por tipo e nível
    allAlerts.forEach(alert => {
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
      alertsByLevel[alert.level] = (alertsByLevel[alert.level] || 0) + 1;
    });

    // Obtém alertas recentes (últimas 24 horas)
    const recentAlerts = allAlerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return alertTime > dayAgo;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalAlerts: allAlerts.length,
      alertsByType,
      alertsByLevel,
      recentAlerts: recentAlerts.slice(0, 50) // Últimos 50 alertas
    };
  }

  /**
   * Limpa histórico de alertas antigos
   */
  static cleanupOldAlerts(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 dias
    const cutoffTime = Date.now() - maxAge;
    
    for (const [key, alerts] of this.alertHistory.entries()) {
      const filteredAlerts = alerts.filter(alert => 
        new Date(alert.timestamp).getTime() > cutoffTime
      );
      
      if (filteredAlerts.length === 0) {
        this.alertHistory.delete(key);
        this.lastAlertTimes.delete(key);
      } else {
        this.alertHistory.set(key, filteredAlerts);
      }
    }
  }
}
