import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('metricas_tiempo_real')
export class MetricasTiempoRealEntity {
  @PrimaryColumn()
  fecha: string; // YYYY-MM-DD format

  @Column({ name: 'total_inscripciones', default: 0 })
  totalInscripciones: number;

  @Column({ name: 'inscripciones_confirmadas', default: 0 })
  inscripcionesConfirmadas: number;

  @Column({ name: 'inscripciones_rechazadas', default: 0 })
  inscripcionesRechazadas: number;

  @Column({ name: 'inscripciones_pendientes', default: 0 })
  inscripcionesPendientes: number;

  @Column({ name: 'ingresos_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  ingresosTotal: number;

  @Column({ name: 'promedio_tiempo_procesamiento', type: 'decimal', precision: 8, scale: 2, default: 0 })
  promedioTiempoProcesamiento: number;

  @Column({ name: 'cursos_completados', default: 0 })
  cursosCompletados: number;

  @Column({ name: 'promedio_calificaciones', type: 'decimal', precision: 4, scale: 2, default: 0 })
  promedioCalificaciones: number;

  @Column({ name: 'tasa_conversion', type: 'decimal', precision: 5, scale: 4, default: 0 })
  tasaConversion: number;

  @Column({ name: 'usuarios_activos', default: 0 })
  usuariosActivos: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
