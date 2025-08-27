import { Injectable, Logger } from '@nestjs/common';
import { dataSource } from '@modules/performance/data-source';
import { PerformanceType } from '@modules/performance/interfaces/performance-type.enum';
import { IQueryMetrics } from '@modules/performance/interfaces/query-metrics.interface';
import { IPerformanceAlert } from '@modules/performance/interfaces/performance-alert.interface';
import { IPerformanceContext } from '@modules/performance/interfaces/performance-context.interface';
import { IPerformanceThresholds } from '@modules/performance/interfaces/performance-threshold.interface';

@Injectable()
export class GraphQLPerformanceService {
  private thresholds: IPerformanceThresholds;

  constructor(private readonly logger: Logger) { }

  configurarUmbrales(thresholds: Partial<IPerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };

    this.logger.log(`Umbrales de performance actualizados: ${JSON.stringify(this.thresholds)}`);
  }

  registrarMetrica(context: IPerformanceContext, duracion: number, error?: Error): void {
    const operacion = context.operationName || 'UnknownOperation';

    const metricas = dataSource.metricas.get(operacion) || {
      errorCount: 0,
      tiempoMaximo: 0,
      tiempoPromedio: 0,
      totalEjecuciones: 0,
      tiempoMinimo: Infinity,
      complejidadPromedio: 0,
      ultimaEjecucion: new Date(),
    };

    metricas.totalEjecuciones++;

    metricas.tiempoPromedio = this.calcularNuevoPromedio(
      metricas.tiempoPromedio,
      duracion,
      metricas.totalEjecuciones
    );

    metricas.tiempoMaximo = Math.max(metricas.tiempoMaximo, duracion);
    metricas.tiempoMinimo = Math.min(metricas.tiempoMinimo, duracion);
    metricas.ultimaEjecucion = new Date();

    if (error) {
      metricas.errorCount++;
    }

    if (context.complexity) {
      metricas.complejidadPromedio = this.calcularNuevoPromedio(
        metricas.complejidadPromedio || 0,
        context.complexity,
        metricas.totalEjecuciones
      );
    }

    dataSource.metricas.set(operacion, metricas);

    this.verificarUmbrales(context, duracion);
  }

  obtenerMetricas(operacion: string): IQueryMetrics | undefined {
    return dataSource.metricas.get(operacion);
  }

  obtenerTodasLasMetricas(): Map<string, IQueryMetrics> {
    return new Map(dataSource.metricas);
  }

  suscribirseAlertas(callback: (alert: IPerformanceAlert) => void): void {
    dataSource.alertSubscribers.push(callback);
  }

  limpiarMetricas(): void {
    dataSource.metricas.clear();

    this.logger.log('Métricas de performance limpiadas');
  }

  exportarMetricas(): Record<string, IQueryMetrics> {
    const metricas: Record<string, IQueryMetrics> = {};

    dataSource.metricas.forEach((valor, clave) => {
      metricas[clave] = { ...valor };
    });

    return metricas;
  }

  private calcularNuevoPromedio(promedioActual: number, nuevoValor: number, totalEjecuciones: number): number {
    return ((promedioActual * (totalEjecuciones - 1)) + nuevoValor) / totalEjecuciones;
  }

  private verificarUmbrales(context: IPerformanceContext, duracion: number): void {
    const operacion = context.operationName || 'UnknownOperation';

    if (duracion > this.thresholds.tiempoMaximoMs) {
      this.enviarAlerta({
        operacion,
        valor: duracion,
        contexto: context,
        timestamp: new Date(),
        tipo: PerformanceType.QUERY_LENTA,
        umbral: this.thresholds.tiempoMaximoMs,
      });
    }

    if (context.complexity && context.complexity > this.thresholds.complejidadMaxima) {
      this.enviarAlerta({
        operacion,
        contexto: context,
        timestamp: new Date(),
        valor: context.complexity,
        tipo: PerformanceType.COMPLEJIDAD_ALTA,
        umbral: this.thresholds.complejidadMaxima,
      });
    }

    if (context.depth && context.depth > this.thresholds.profundidadMaxima) {
      this.enviarAlerta({
        operacion,
        contexto: context,
        valor: context.depth,
        timestamp: new Date(),
        umbral: this.thresholds.profundidadMaxima,
        tipo: PerformanceType.PROFUNDIDAD_EXCESIVA,
      });
    }
  }

  private enviarAlerta(alert: IPerformanceAlert): void {
    this.logger.warn(`Alerta de Performance: ${alert.tipo} - ${alert.operacion}`, {
      valor: alert.valor,
      umbral: alert.umbral,
      contexto: alert.contexto
    });

    dataSource.alertSubscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        this.logger.error('Error enviando alerta a suscriptor', error);
      }
    });
  }
}
