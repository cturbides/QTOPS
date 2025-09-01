import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('inscripcion_analytics')
@Index(['fechaCreacion'])
@Index(['cursoId'])
@Index(['estado'])
export class InscripcionAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inscripcion_id' })
  @Index()
  inscripcionId: string;

  @Column({ name: 'usuario_id' })
  @Index()
  usuarioId: string;

  @Column({ name: 'curso_id' })
  @Index()
  cursoId: string;

  @Column({ name: 'estado', default: 'PENDIENTE' })
  estado: string;

  @Column({ name: 'requiere_pago', default: false })
  requierePago: boolean;

  @Column({ name: 'monto', type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ name: 'metodo_pago', nullable: true })
  metodoPago: string;

  @Column({ name: 'fecha_solicitud' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_confirmacion', nullable: true })
  fechaConfirmacion: Date;

  @Column({ name: 'fecha_rechazo', nullable: true })
  fechaRechazo: Date;

  @Column({ name: 'tiempo_procesamiento_segundos', nullable: true })
  tiempoProcesamiento: number;

  @Column({ name: 'pago_exitoso', default: false })
  pagoExitoso: boolean;

  @Column({ name: 'curso_completado', default: false })
  cursoCompletado: boolean;

  @Column({ name: 'calificacion_final', type: 'decimal', precision: 4, scale: 2, nullable: true })
  calificacionFinal: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
