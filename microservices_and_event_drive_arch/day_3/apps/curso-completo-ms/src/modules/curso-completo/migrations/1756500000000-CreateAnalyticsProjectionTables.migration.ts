import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsProjectionTables1756500000000 implements MigrationInterface {
  name = 'CreateAnalyticsProjectionTables1756500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de analytics de inscripciones
    await queryRunner.query(`
      CREATE TABLE inscripcion_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inscripcion_id VARCHAR(255) NOT NULL,
        usuario_id VARCHAR(255) NOT NULL,
        curso_id VARCHAR(255) NOT NULL,
        estado VARCHAR(50) DEFAULT 'PENDIENTE',
        requiere_pago BOOLEAN DEFAULT false,
        monto DECIMAL(10,2),
        metodo_pago VARCHAR(100),
        fecha_solicitud TIMESTAMP NOT NULL,
        fecha_confirmacion TIMESTAMP,
        fecha_rechazo TIMESTAMP,
        tiempo_procesamiento_segundos INTEGER,
        pago_exitoso BOOLEAN DEFAULT false,
        curso_completado BOOLEAN DEFAULT false,
        calificacion_final DECIMAL(4,2),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de métricas en tiempo real
    await queryRunner.query(`
      CREATE TABLE metricas_tiempo_real (
        fecha VARCHAR(10) PRIMARY KEY,
        total_inscripciones INTEGER DEFAULT 0,
        inscripciones_confirmadas INTEGER DEFAULT 0,
        inscripciones_rechazadas INTEGER DEFAULT 0,
        inscripciones_pendientes INTEGER DEFAULT 0,
        ingresos_total DECIMAL(12,2) DEFAULT 0,
        promedio_tiempo_procesamiento DECIMAL(8,2) DEFAULT 0,
        cursos_completados INTEGER DEFAULT 0,
        promedio_calificaciones DECIMAL(4,2) DEFAULT 0,
        tasa_conversion DECIMAL(5,4) DEFAULT 0,
        usuarios_activos INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para optimizar consultas
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_inscripcion_id ON inscripcion_analytics(inscripcion_id)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_usuario_id ON inscripcion_analytics(usuario_id)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_curso_id ON inscripcion_analytics(curso_id)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_estado ON inscripcion_analytics(estado)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_fecha_creacion ON inscripcion_analytics(fecha_creacion)`);
    await queryRunner.query(`CREATE INDEX idx_inscripcion_analytics_composite ON inscripcion_analytics(usuario_id, curso_id, estado)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS metricas_tiempo_real`);
    await queryRunner.query(`DROP TABLE IF EXISTS inscripcion_analytics`);
  }
}
