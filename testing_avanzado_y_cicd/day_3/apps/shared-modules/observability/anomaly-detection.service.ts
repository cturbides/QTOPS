import { Injectable, Logger } from '@nestjs/common';
import { PrometheusMetricsService } from './prometheus-metrics.service';
import { DistributedLogger } from './distributed-logger.service';

export interface EnrollmentAnomaly {
  type: 'spike' | 'drop' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
  timestamp: Date;
  metadata?: any;
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);
  
  // Configuración de umbrales
  private readonly thresholds = {
    enrollmentSpike: {
      moderate: 2.0,  // 2x el promedio
      high: 3.0,      // 3x el promedio
      critical: 5.0   // 5x el promedio
    },
    enrollmentDrop: {
      moderate: 0.5,  // 50% menos que el promedio
      high: 0.3,      // 70% menos
      critical: 0.1   // 90% menos
    },
    errorRate: {
      moderate: 0.05, // 5% error rate
      high: 0.10,     // 10% error rate
      critical: 0.25  // 25% error rate
    }
  };

  constructor(
    private readonly metrics: PrometheusMetricsService,
    private readonly distributedLogger: DistributedLogger,
  ) {}

  async detectEnrollmentAnomalies(correlationId: string): Promise<EnrollmentAnomaly[]> {
    const anomalies: EnrollmentAnomaly[] = [];

    try {
      // Obtener métricas actuales
      const currentEnrollments = await this.getCurrentEnrollmentCount();
      const recentAverage = await this.calculateRecentAverage();
      const errorRate = await this.calculateErrorRate();

      // Detectar anomalías de volumen
      const volumeAnomalies = this.detectVolumeAnomalies(currentEnrollments, recentAverage);
      anomalies.push(...volumeAnomalies);

      // Detectar anomalías de errores
      const errorAnomalies = this.detectErrorAnomalies(errorRate);
      anomalies.push(...errorAnomalies);

      // Detectar patrones inusuales de tiempo
      const timePatternAnomalies = this.detectTimePatternAnomalies(currentEnrollments);
      anomalies.push(...timePatternAnomalies);

      // Log anomalías detectadas
      if (anomalies.length > 0) {
        this.distributedLogger.warn('Anomalías detectadas en patrones de inscripción', correlationId, {
          anomaliesCount: anomalies.length,
          anomalies: anomalies.map(a => ({
            type: a.type,
            severity: a.severity,
            description: a.description
          }))
        });
      }

    } catch (error) {
      this.distributedLogger.error('Error detectando anomalías', correlationId, {
        error: error.message
      });
    }

    return anomalies;
  }

  private detectVolumeAnomalies(current: number, average: number): EnrollmentAnomaly[] {
    const anomalies: EnrollmentAnomaly[] = [];

    // Detectar picos
    if (current > average * this.thresholds.enrollmentSpike.critical) {
      anomalies.push({
        type: 'spike',
        severity: 'critical',
        description: `Pico crítico de inscripciones detectado: ${current} vs promedio ${average.toFixed(2)}`,
        currentValue: current,
        expectedRange: { min: average * 0.8, max: average * 1.2 },
        timestamp: new Date()
      });
    } else if (current > average * this.thresholds.enrollmentSpike.high) {
      anomalies.push({
        type: 'spike',
        severity: 'high',
        description: `Pico alto de inscripciones detectado: ${current} vs promedio ${average.toFixed(2)}`,
        currentValue: current,
        expectedRange: { min: average * 0.8, max: average * 1.2 },
        timestamp: new Date()
      });
    }

    // Detectar caídas
    if (current < average * this.thresholds.enrollmentDrop.critical) {
      anomalies.push({
        type: 'drop',
        severity: 'critical',
        description: `Caída crítica de inscripciones detectada: ${current} vs promedio ${average.toFixed(2)}`,
        currentValue: current,
        expectedRange: { min: average * 0.8, max: average * 1.2 },
        timestamp: new Date()
      });
    }

    return anomalies;
  }

  private detectErrorAnomalies(errorRate: number): EnrollmentAnomaly[] {
    const anomalies: EnrollmentAnomaly[] = [];

    if (errorRate > this.thresholds.errorRate.critical) {
      anomalies.push({
        type: 'unusual_pattern',
        severity: 'critical',
        description: `Tasa de error crítica en inscripciones: ${(errorRate * 100).toFixed(2)}%`,
        currentValue: errorRate,
        expectedRange: { min: 0, max: 0.02 },
        timestamp: new Date(),
        metadata: { type: 'error_rate' }
      });
    } else if (errorRate > this.thresholds.errorRate.high) {
      anomalies.push({
        type: 'unusual_pattern',
        severity: 'high',
        description: `Tasa de error alta en inscripciones: ${(errorRate * 100).toFixed(2)}%`,
        currentValue: errorRate,
        expectedRange: { min: 0, max: 0.02 },
        timestamp: new Date(),
        metadata: { type: 'error_rate' }
      });
    }

    return anomalies;
  }

  private detectTimePatternAnomalies(current: number): EnrollmentAnomaly[] {
    const anomalies: EnrollmentAnomaly[] = [];
    const currentHour = new Date().getHours();

    // Detectar actividad inusual fuera de horario laboral
    if ((currentHour < 7 || currentHour > 22) && current > 10) {
      anomalies.push({
        type: 'unusual_pattern',
        severity: 'medium',
        description: `Actividad de inscripción inusual fuera de horario: ${current} inscripciones a las ${currentHour}:00`,
        currentValue: current,
        expectedRange: { min: 0, max: 5 },
        timestamp: new Date(),
        metadata: { type: 'time_pattern', hour: currentHour }
      });
    }

    return anomalies;
  }

  private async getCurrentEnrollmentCount(): Promise<number> {
    // Simulación del conteo actual de inscripciones
    // En producción, esto consultaría las métricas de Prometheus
    return Math.floor(Math.random() * 100) + 20; // Entre 20 y 120 inscripciones
  }

  private async calculateRecentAverage(): Promise<number> {
    // Simulación del cálculo del promedio de los últimos 7 días
    // En producción, esto consultaría métricas históricas
    return 50; // Promedio base de 50 inscripciones
  }

  private async calculateErrorRate(): Promise<number> {
    // Simulación del cálculo de tasa de error
    // En producción, esto consultaría métricas de Prometheus
    return Math.random() * 0.1; // Tasa de error aleatoria para demo
  }
}
