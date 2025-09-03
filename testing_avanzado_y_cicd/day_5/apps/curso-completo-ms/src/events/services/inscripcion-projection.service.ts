import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InscripcionAnalyticsEntity } from '../entities/inscripcion-analytics.entity';
import { MetricasTiempoRealEntity } from '../entities/metricas-tiempo-real.entity';

// Eventos
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';
import { InscripcionConfirmadaEvent } from '../domain-events/inscripcion-confirmada.event';
import { InscripcionRechazadaEvent } from '../domain-events/inscripcion-rechazada.event';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';

@Injectable()
export class InscripcionProjectionService {
  private readonly logger = new Logger(InscripcionProjectionService.name);

  constructor(
    @InjectRepository(InscripcionAnalyticsEntity)
    private readonly analyticsRepo: Repository<InscripcionAnalyticsEntity>,
    @InjectRepository(MetricasTiempoRealEntity)
    private readonly metricsRepo: Repository<MetricasTiempoRealEntity>
  ) {}

  async procesarInscripcionSolicitada(event: InscripcionSolicitadaEvent): Promise<void> {
    this.logger.log(`📊 Procesando inscripción solicitada: ${event.inscripcionId}`);

    const analytics = new InscripcionAnalyticsEntity();
    analytics.inscripcionId = event.inscripcionId;
    analytics.usuarioId = event.usuarioId;
    analytics.cursoId = event.cursoId;
    analytics.estado = 'PENDIENTE';
    analytics.requierePago = event.requierePago;
    analytics.monto = event.monto || 0;
    analytics.metodoPago = event.metodoPago;
    analytics.fechaSolicitud = event.timestamp;

    await this.analyticsRepo.save(analytics);
    await this.actualizarMetricasDiarias();

    this.logger.log(`✅ Proyección actualizada para inscripción: ${event.inscripcionId}`);
  }

  async procesarInscripcionConfirmada(event: InscripcionConfirmadaEvent): Promise<void> {
    this.logger.log(`📊 Procesando inscripción confirmada: ${event.inscripcionId}`);

    const analytics = await this.analyticsRepo.findOne({
      where: { inscripcionId: event.inscripcionId }
    });

    if (analytics) {
      analytics.estado = 'CONFIRMADA';
      analytics.fechaConfirmacion = event.fechaConfirmacion;
      
      // Calcular tiempo de procesamiento
      const tiempoProcesamiento = Math.round(
        (event.fechaConfirmacion.getTime() - analytics.fechaSolicitud.getTime()) / 1000
      );
      analytics.tiempoProcesamiento = tiempoProcesamiento;

      await this.analyticsRepo.save(analytics);
      await this.actualizarMetricasDiarias();

      this.logger.log(`✅ Inscripción confirmada actualizada: ${event.inscripcionId}`);
    }
  }

  async procesarInscripcionRechazada(event: InscripcionRechazadaEvent): Promise<void> {
    this.logger.log(`📊 Procesando inscripción rechazada: ${event.inscripcionId}`);

    const analytics = await this.analyticsRepo.findOne({
      where: { inscripcionId: event.inscripcionId }
    });

    if (analytics) {
      analytics.estado = 'RECHAZADA';
      analytics.fechaRechazo = event.timestamp;

      await this.analyticsRepo.save(analytics);
      await this.actualizarMetricasDiarias();

      this.logger.log(`✅ Inscripción rechazada actualizada: ${event.inscripcionId}`);
    }
  }

  async procesarPagoRealizado(event: PagoRealizadoEvent): Promise<void> {
    this.logger.log(`📊 Procesando pago realizado para usuario: ${event.usuarioId}`);

    // Actualizar todas las inscripciones pendientes del usuario para los cursos adquiridos
    for (const cursoId of event.cursosAdquiridos) {
      const analytics = await this.analyticsRepo.findOne({
        where: { 
          usuarioId: event.usuarioId,
          cursoId: cursoId,
          estado: 'PENDIENTE'
        }
      });

      if (analytics) {
        analytics.pagoExitoso = true;
        await this.analyticsRepo.save(analytics);
      }
    }

    await this.actualizarMetricasDiarias();
    this.logger.log(`✅ Pago procesado para usuario: ${event.usuarioId}`);
  }

  async procesarCursoCompletado(event: CursoCompletadoEvent): Promise<void> {
    this.logger.log(`📊 Procesando curso completado: ${event.cursoId} por usuario: ${event.estudianteId}`);

    const analytics = await this.analyticsRepo.findOne({
      where: { 
        usuarioId: event.estudianteId,
        cursoId: event.cursoId,
        estado: 'CONFIRMADA'
      }
    });

    if (analytics) {
      analytics.cursoCompletado = true;
      analytics.calificacionFinal = event.calificacionFinal;
      await this.analyticsRepo.save(analytics);
      await this.actualizarMetricasDiarias();

      this.logger.log(`✅ Curso completado actualizado: ${event.cursoId}`);
    }
  }

  private async actualizarMetricasDiarias(): Promise<void> {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const inicioDelDia = new Date(hoy + 'T00:00:00.000Z');
    const finDelDia = new Date(hoy + 'T23:59:59.999Z');

    // Obtener métricas del día
    const metricas = await this.calcularMetricasDia(inicioDelDia, finDelDia);

    // Buscar o crear registro de métricas del día
    let metricasDia = await this.metricsRepo.findOne({ where: { fecha: hoy } });
    
    if (!metricasDia) {
      metricasDia = new MetricasTiempoRealEntity();
      metricasDia.fecha = hoy;
    }

    // Actualizar métricas
    Object.assign(metricasDia, metricas);
    
    await this.metricsRepo.save(metricasDia);
    this.logger.log(`📈 Métricas actualizadas para el día: ${hoy}`);
  }

  private async calcularMetricasDia(inicio: Date, fin: Date) {
    const inscripcionesDelDia = await this.analyticsRepo.find({
      where: {
        fechaCreacion: Between(inicio, fin)
      }
    });

    const totalInscripciones = inscripcionesDelDia.length;
    const inscripcionesConfirmadas = inscripcionesDelDia.filter(i => i.estado === 'CONFIRMADA').length;
    const inscripcionesRechazadas = inscripcionesDelDia.filter(i => i.estado === 'RECHAZADA').length;
    const inscripcionesPendientes = inscripcionesDelDia.filter(i => i.estado === 'PENDIENTE').length;

    const ingresosTotal = inscripcionesDelDia
      .filter(i => i.pagoExitoso)
      .reduce((sum, i) => sum + (i.monto || 0), 0);

    const tiemposProcesamiento = inscripcionesDelDia
      .filter(i => i.tiempoProcesamiento)
      .map(i => i.tiempoProcesamiento);
    
    const promedioTiempoProcesamiento = tiemposProcesamiento.length > 0
      ? tiemposProcesamiento.reduce((sum, t) => sum + t, 0) / tiemposProcesamiento.length
      : 0;

    const cursosCompletados = inscripcionesDelDia.filter(i => i.cursoCompletado).length;

    const calificaciones = inscripcionesDelDia
      .filter(i => i.calificacionFinal)
      .map(i => i.calificacionFinal);
    
    const promedioCalificaciones = calificaciones.length > 0
      ? calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length
      : 0;

    const tasaConversion = totalInscripciones > 0 
      ? inscripcionesConfirmadas / totalInscripciones 
      : 0;

    const usuariosUnicos = new Set(inscripcionesDelDia.map(i => i.usuarioId));
    const usuariosActivos = usuariosUnicos.size;

    return {
      totalInscripciones,
      inscripcionesConfirmadas,
      inscripcionesRechazadas,
      inscripcionesPendientes,
      ingresosTotal,
      promedioTiempoProcesamiento,
      cursosCompletados,
      promedioCalificaciones,
      tasaConversion,
      usuariosActivos
    };
  }

  // Métodos de consulta para análisis
  async obtenerMetricasDelDia(fecha?: string): Promise<MetricasTiempoRealEntity> {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    return await this.metricsRepo.findOne({ where: { fecha: fechaConsulta } });
  }

  async obtenerTendenciaInscripciones(dias: number = 7): Promise<MetricasTiempoRealEntity[]> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    
    return await this.metricsRepo
      .createQueryBuilder('metricas')
      .where('metricas.fecha >= :fechaInicio', { fechaInicio: fechaInicio.toISOString().split('T')[0] })
      .orderBy('metricas.fecha', 'ASC')
      .getMany();
  }

  async obtenerAnalisisDetallado(cursoId?: string, usuarioId?: string) {
    const query = this.analyticsRepo.createQueryBuilder('analytics');
    
    if (cursoId) {
      query.andWhere('analytics.cursoId = :cursoId', { cursoId });
    }
    
    if (usuarioId) {
      query.andWhere('analytics.usuarioId = :usuarioId', { usuarioId });
    }

    return await query
      .orderBy('analytics.fechaCreacion', 'DESC')
      .getMany();
  }
}
