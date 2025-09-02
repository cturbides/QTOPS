import { Injectable, Logger } from '@nestjs/common';
import { DistributedLogger } from './distributed-logger.service';
import { EnrollmentAnomaly } from './anomaly-detection.service';

export interface NotificationChannel {
  type: 'slack' | 'email' | 'webhook' | 'console';
  endpoint?: string;
  credentials?: any;
  enabled: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  anomalies: EnrollmentAnomaly[];
  acknowledged: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class AlertNotificationService {
  private readonly logger = new Logger(AlertNotificationService.name);
  
  // Configuración de canales
  private readonly channels: NotificationChannel[] = [
    {
      type: 'console',
      enabled: true // Siempre habilitado para desarrollo
    },
    {
      type: 'slack',
      endpoint: process.env.SLACK_WEBHOOK_URL,
      enabled: !!process.env.SLACK_WEBHOOK_URL
    },
    {
      type: 'email',
      credentials: {
        smtp: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    },
    {
      type: 'webhook',
      endpoint: process.env.OPERATIONS_WEBHOOK_URL,
      enabled: !!process.env.OPERATIONS_WEBHOOK_URL
    }
  ];

  constructor(private readonly distributedLogger: DistributedLogger) {}

  async sendAlert(anomalies: EnrollmentAnomaly[], correlationId: string): Promise<void> {
    if (anomalies.length === 0) return;

    const notification = this.createNotification(anomalies);
    
    this.distributedLogger.info('Enviando alerta de anomalías', correlationId, {
      alertId: notification.id,
      severity: notification.severity,
      anomaliesCount: anomalies.length
    });

    // Enviar a todos los canales habilitados
    const sendPromises = this.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(channel, notification, correlationId));

    try {
      await Promise.allSettled(sendPromises);
      this.distributedLogger.info('Alerta enviada a todos los canales disponibles', correlationId);
    } catch (error) {
      this.distributedLogger.error('Error enviando alertas', correlationId, {
        error: error.message
      });
    }
  }

  private createNotification(anomalies: EnrollmentAnomaly[]): AlertNotification {
    // Determinar severidad general
    const maxSeverity = this.getMaxSeverity(anomalies);
    
    // Crear mensaje descriptivo
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalies.filter(a => a.severity === 'high').length;
    
    let title = '🚨 Anomalía en Patrones de Inscripción Detectada';
    if (criticalCount > 0) {
      title = '🔴 CRÍTICO: Anomalías Severas en Inscripciones';
    } else if (highCount > 0) {
      title = '🟠 ALERTA: Anomalías Importantes en Inscripciones';
    }

    const message = this.buildAlertMessage(anomalies);

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      severity: maxSeverity,
      timestamp: new Date(),
      anomalies,
      acknowledged: false
    };
  }

  private buildAlertMessage(anomalies: EnrollmentAnomaly[]): string {
    let message = `Se detectaron ${anomalies.length} anomalía(s) en los patrones de inscripción:\n\n`;

    anomalies.forEach((anomaly, index) => {
      const severityEmoji = this.getSeverityEmoji(anomaly.severity);
      message += `${index + 1}. ${severityEmoji} **${anomaly.type.toUpperCase()}** (${anomaly.severity})\n`;
      message += `   ${anomaly.description}\n`;
      message += `   Valor actual: ${anomaly.currentValue}\n`;
      message += `   Rango esperado: ${anomaly.expectedRange.min.toFixed(1)} - ${anomaly.expectedRange.max.toFixed(1)}\n`;
      message += `   Timestamp: ${anomaly.timestamp.toISOString()}\n\n`;
    });

    message += `📊 **Acciones Recomendadas:**\n`;
    message += `• Revisar métricas en Grafana: http://localhost:3030\n`;
    message += `• Verificar logs de aplicación\n`;
    message += `• Contactar al equipo de desarrollo si persiste\n\n`;
    message += `🔍 **Dashboard:** http://localhost:3030/d/elearning-microservices\n`;
    message += `📈 **Prometheus:** http://localhost:9090\n`;

    return message;
  }

  private async sendToChannel(
    channel: NotificationChannel, 
    notification: AlertNotification, 
    correlationId: string
  ): Promise<void> {
    try {
      switch (channel.type) {
        case 'console':
          await this.sendToConsole(notification);
          break;
        case 'slack':
          await this.sendToSlack(channel, notification);
          break;
        case 'email':
          await this.sendToEmail(channel, notification);
          break;
        case 'webhook':
          await this.sendToWebhook(channel, notification);
          break;
      }

      this.distributedLogger.info(`Alerta enviada a ${channel.type}`, correlationId);
    } catch (error) {
      this.distributedLogger.error(`Error enviando alerta a ${channel.type}`, correlationId, {
        error: error.message
      });
    }
  }

  private async sendToConsole(notification: AlertNotification): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 ALERTA DE ANOMALÍA EN INSCRIPCIONES');
    console.log('='.repeat(80));
    console.log(`📅 Timestamp: ${notification.timestamp.toISOString()}`);
    console.log(`🔍 Alert ID: ${notification.id}`);
    console.log(`⚠️  Severidad: ${notification.severity.toUpperCase()}`);
    console.log(`📊 Anomalías: ${notification.anomalies.length}`);
    console.log('\n' + notification.message);
    console.log('='.repeat(80) + '\n');
  }

  private async sendToSlack(channel: NotificationChannel, notification: AlertNotification): Promise<void> {
    if (!channel.endpoint) return;

    const payload = {
      text: notification.title,
      attachments: [{
        color: this.getSeverityColor(notification.severity),
        fields: [
          {
            title: 'Severidad',
            value: notification.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Anomalías Detectadas',
            value: notification.anomalies.length.toString(),
            short: true
          },
          {
            title: 'Detalles',
            value: notification.message.substring(0, 500) + '...',
            short: false
          }
        ],
        timestamp: Math.floor(notification.timestamp.getTime() / 1000)
      }]
    };

    // Simulación del envío a Slack
    this.logger.log(`[SLACK] Enviando alerta: ${JSON.stringify(payload, null, 2)}`);
  }

  private async sendToEmail(channel: NotificationChannel, notification: AlertNotification): Promise<void> {
    const emailPayload = {
      to: process.env.OPERATIONS_EMAIL || 'operations@company.com',
      subject: notification.title,
      html: this.buildEmailTemplate(notification)
    };

    // Simulación del envío de email
    this.logger.log(`[EMAIL] Enviando alerta: ${JSON.stringify(emailPayload, null, 2)}`);
  }

  private async sendToWebhook(channel: NotificationChannel, notification: AlertNotification): Promise<void> {
    if (!channel.endpoint) return;

    const payload = {
      alertId: notification.id,
      severity: notification.severity,
      timestamp: notification.timestamp,
      anomalies: notification.anomalies.map(a => ({
        type: a.type,
        severity: a.severity,
        description: a.description,
        currentValue: a.currentValue,
        expectedRange: a.expectedRange
      }))
    };

    // Simulación del envío a webhook
    this.logger.log(`[WEBHOOK] Enviando alerta: ${JSON.stringify(payload, null, 2)}`);
  }

  private buildEmailTemplate(notification: AlertNotification): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2 style="color: ${this.getSeverityColor(notification.severity)};">
            ${notification.title}
          </h2>
          <p><strong>Timestamp:</strong> ${notification.timestamp.toISOString()}</p>
          <p><strong>Alert ID:</strong> ${notification.id}</p>
          <p><strong>Severidad:</strong> ${notification.severity.toUpperCase()}</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <pre style="white-space: pre-wrap;">${notification.message}</pre>
          </div>
          
          <p>
            <a href="http://localhost:3030" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none;">
              Ver Dashboard
            </a>
          </p>
        </body>
      </html>
    `;
  }

  private getMaxSeverity(anomalies: EnrollmentAnomaly[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return anomalies.reduce((max, anomaly) => 
      severityOrder[anomaly.severity] > severityOrder[max] ? anomaly.severity : max
    , 'low');
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return emojis[severity] || '❓';
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',
      medium: '#ffeb3b',
      high: '#ff9800',
      critical: '#f44336'
    };
    return colors[severity] || '#9e9e9e';
  }
}
