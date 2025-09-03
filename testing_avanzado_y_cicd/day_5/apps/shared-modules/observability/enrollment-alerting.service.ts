import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { AlertNotificationService } from './alert-notification.service';
import { DistributedLogger } from './distributed-logger.service';

@Injectable()
export class EnrollmentAlertingService {
  private readonly logger = new Logger(EnrollmentAlertingService.name);
  private isEnabled: boolean;
  private lastCheckTimestamp: Date | null = null;

  constructor(
    private readonly anomalyDetection: AnomalyDetectionService,
    private readonly notifications: AlertNotificationService,
    private readonly distributedLogger: DistributedLogger,
  ) {
    this.isEnabled = process.env.ALERTING_ENABLED !== 'false';
    this.logger.log(`Enrollment Alerting Service iniciado. Enabled: ${this.isEnabled}`);
  }

  // Ejecutar cada 2 minutos para demo (en producción sería cada 5-10 minutos)
  @Cron('*/2 * * * *', {
    name: 'enrollment-anomaly-check',
    timeZone: 'America/Santo_Domingo',
  })
  async checkEnrollmentAnomalies(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const correlationId = `anomaly-check-${Date.now()}`;
    
    try {
      this.distributedLogger.info('Iniciando verificación de anomalías de inscripción', correlationId);
      
      // Detectar anomalías
      const anomalies = await this.anomalyDetection.detectEnrollmentAnomalies(correlationId);
      
      if (anomalies.length > 0) {
        this.distributedLogger.warn(`Detectadas ${anomalies.length} anomalías`, correlationId, {
          anomaliesTypes: anomalies.map(a => a.type),
          severities: anomalies.map(a => a.severity)
        });

        // Enviar notificaciones
        await this.notifications.sendAlert(anomalies, correlationId);
        
        // Actualizar métricas de alerting
        this.updateAlertingMetrics(anomalies);
        
      } else {
        this.distributedLogger.debug('No se detectaron anomalías en esta verificación', correlationId);
      }

      this.lastCheckTimestamp = new Date();
      
    } catch (error) {
      this.distributedLogger.error('Error en verificación de anomalías', correlationId, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  // Método manual para testing
  async triggerManualCheck(correlationId?: string): Promise<void> {
    const checkId = correlationId || `manual-check-${Date.now()}`;
    
    this.distributedLogger.info('Verificación manual de anomalías activada', checkId);
    
    try {
      await this.checkEnrollmentAnomalies();
      this.distributedLogger.info('Verificación manual completada', checkId);
    } catch (error) {
      this.distributedLogger.error('Error en verificación manual', checkId, {
        error: error.message
      });
      throw error;
    }
  }

  // Generar anomalía artificial para testing
  async simulateAnomaly(type: 'spike' | 'drop' | 'error', correlationId?: string): Promise<void> {
    const testId = correlationId || `test-anomaly-${Date.now()}`;
    
    this.distributedLogger.info(`Simulando anomalía de tipo: ${type}`, testId);

    const testAnomalies = [{
      type: type as any,
      severity: 'high' as const,
      description: `Anomalía simulada de tipo ${type} para testing del sistema de alerting`,
      currentValue: type === 'spike' ? 200 : type === 'drop' ? 5 : 0.15,
      expectedRange: { min: 40, max: 60 },
      timestamp: new Date(),
      metadata: { simulated: true, testId }
    }];

    await this.notifications.sendAlert(testAnomalies, testId);
    
    this.distributedLogger.info('Anomalía simulada enviada', testId);
  }

  private updateAlertingMetrics(anomalies: any[]): void {
    // Aquí se actualizarían métricas específicas de alerting
    // Por ejemplo, contadores de alertas enviadas por tipo y severidad
    this.logger.log(`Métricas de alerting actualizadas: ${anomalies.length} alertas`);
  }

  getStatus(): any {
    return {
      enabled: this.isEnabled,
      lastCheckTimestamp: this.lastCheckTimestamp,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  enable(): void {
    this.isEnabled = true;
    this.distributedLogger.info('Sistema de alerting habilitado');
  }

  disable(): void {
    this.isEnabled = false;
    this.distributedLogger.info('Sistema de alerting deshabilitado');
  }
}
