import dotenv from 'dotenv';

dotenv.config();

export interface AlertingConfig {
  enabled: boolean;
  webhooks: {
    slack?: {
      url: string;
      channel?: string;
      username?: string;
    };
    discord?: {
      url: string;
      username?: string;
    };
  };
  thresholds: {
    responseTime: {
      warning: number; // ms
      critical: number; // ms
    };
    errorRate: {
      warning: number; // percentage
      critical: number; // percentage
    };
    memoryUsage: {
      warning: number; // percentage
      critical: number; // percentage
    };
    databaseConnection: {
      maxFailures: number;
      timeWindow: number; // ms
    };
  };
  debouncing: {
    enabled: boolean;
    gracePeriod: number; // ms
    maxAlertsPerPeriod: number;
  };
  notification: {
    retryAttempts: number;
    retryDelay: number; // ms
    timeout: number; // ms
  };
}

export const alertingConfig: AlertingConfig = {
  enabled: process.env.ALERTING_ENABLED === 'true',
  
  webhooks: {
    slack: process.env.SLACK_WEBHOOK_URL ? {
      url: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#alerts',
      username: process.env.SLACK_USERNAME || 'Backoffice API Bot'
    } : undefined,
    
    discord: process.env.DISCORD_WEBHOOK_URL ? {
      url: process.env.DISCORD_WEBHOOK_URL,
      username: process.env.DISCORD_USERNAME || 'Backoffice API Bot'
    } : undefined
  },

  thresholds: {
    responseTime: {
      warning: parseInt(process.env.ALERT_RESPONSE_TIME_WARNING || '500', 10),
      critical: parseInt(process.env.ALERT_RESPONSE_TIME_CRITICAL || '1000', 10)
    },
    errorRate: {
      warning: parseFloat(process.env.ALERT_ERROR_RATE_WARNING || '2.0'),
      critical: parseFloat(process.env.ALERT_ERROR_RATE_CRITICAL || '5.0')
    },
    memoryUsage: {
      warning: parseFloat(process.env.ALERT_MEMORY_WARNING || '80.0'),
      critical: parseFloat(process.env.ALERT_MEMORY_CRITICAL || '90.0')
    },
    databaseConnection: {
      maxFailures: parseInt(process.env.ALERT_DB_MAX_FAILURES || '3', 10),
      timeWindow: parseInt(process.env.ALERT_DB_TIME_WINDOW || '60000', 10) // 1 minuto
    }
  },

  debouncing: {
    enabled: process.env.ALERT_DEBOUNCING_ENABLED !== 'false',
    gracePeriod: parseInt(process.env.ALERT_GRACE_PERIOD || '300000', 10), // 5 minutos
    maxAlertsPerPeriod: parseInt(process.env.ALERT_MAX_PER_PERIOD || '3', 10)
  },

  notification: {
    retryAttempts: parseInt(process.env.ALERT_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.ALERT_RETRY_DELAY || '5000', 10), // 5 segundos
    timeout: parseInt(process.env.ALERT_TIMEOUT || '10000', 10) // 10 segundos
  }
};

export type AlertLevel = 'info' | 'warning' | 'critical';
export type AlertType = 'response_time' | 'error_rate' | 'memory_usage' | 'database_connection' | 'data_validation';

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  metadata: {
    [key: string]: any;
  };
  resolved?: boolean;
  resolvedAt?: string;
}
