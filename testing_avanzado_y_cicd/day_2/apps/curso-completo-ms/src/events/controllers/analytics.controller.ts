import { v4 as uuidv4 } from 'uuid';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { Controller, Get, Query, Param, Logger, Post } from '@nestjs/common';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';
import { DomainEventPublisher } from '../services/domain-event-publisher.service';
import { InscripcionProjectionService } from '../services/inscripcion-projection.service';
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';
import { InscripcionConfirmadaEvent } from '../domain-events/inscripcion-confirmada.event';

@Controller('analytics')
export class AnalyticsController {
    constructor(
        private readonly logger: Logger,
        private readonly eventPublisher: DomainEventPublisher,
        private readonly projectionService: InscripcionProjectionService,
    ) { }

    @Get('metricas-diarias')
    async obtenerMetricasDiarias(@Query('fecha') fecha?: string) {
        this.logger.log(`📊 Consultando métricas diarias para fecha: ${fecha || 'hoy'}`);

        const metricas = await this.projectionService.obtenerMetricasDelDia(fecha);

        return {
            fecha: fecha || new Date().toISOString().split('T')[0],
            metricas: metricas || {
                mensaje: 'No hay datos para la fecha solicitada'
            }
        };
    }

    @Get('tendencia-inscripciones')
    async obtenerTendenciaInscripciones(@Query('dias') dias?: string) {
        const diasNumero = parseInt(dias) || 7;
        this.logger.log(`📈 Consultando tendencia de inscripciones para ${diasNumero} días`);

        const tendencia = await this.projectionService.obtenerTendenciaInscripciones(diasNumero);

        return {
            periodo: `${diasNumero} días`,
            datos: tendencia
        };
    }

    @Get('analisis-detallado')
    async obtenerAnalisisDetallado(
        @Query('cursoId') cursoId?: string,
        @Query('usuarioId') usuarioId?: string
    ) {
        this.logger.log(`🔍 Consultando análisis detallado - Curso: ${cursoId || 'todos'}, Usuario: ${usuarioId || 'todos'}`);

        const analisis = await this.projectionService.obtenerAnalisisDetallado(cursoId, usuarioId);

        return {
            filtros: {
                cursoId: cursoId || null,
                usuarioId: usuarioId || null
            },
            totalRegistros: analisis.length,
            datos: analisis
        };
    }

    @Get('resumen-general')
    async obtenerResumenGeneral() {
        this.logger.log(`📋 Consultando resumen general de analytics`);

        const [metricasHoy, tendencia7Dias] = await Promise.all([
            this.projectionService.obtenerMetricasDelDia(),
            this.projectionService.obtenerTendenciaInscripciones(7)
        ]);

        const crecimientoSemanal = tendencia7Dias.length >= 2
            ? {
                inscripciones: this.calcularCrecimiento(
                    tendencia7Dias[0]?.totalInscripciones || 0,
                    tendencia7Dias[tendencia7Dias.length - 1]?.totalInscripciones || 0
                ),
                ingresos: this.calcularCrecimiento(
                    tendencia7Dias[0]?.ingresosTotal || 0,
                    tendencia7Dias[tendencia7Dias.length - 1]?.ingresosTotal || 0
                )
            }
            : null;

        return {
            metricasHoy,
            crecimientoSemanal,
            tendenciaUltimosSieteDias: tendencia7Dias,
            timestamp: new Date().toISOString()
        };
    }

    private calcularCrecimiento(valorAnterior: number, valorActual: number): number {
        if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
        return Number(((valorActual - valorAnterior) / valorAnterior * 100).toFixed(2));
    }

    // Dummy endpoint
    @Post('demo-flujo-completo')
    async demostrarFlujoCompleto() {
        this.logger.log('🚀 Ejecutando demostración de flujo completo con proyecciones');

        const resultados = {
            eventosPublicados: [],
            tiempoInicio: new Date()
        };

        try {
            const usuarioId = uuidv4();
            const cursoId = uuidv4();
            const inscripcionId = uuidv4();

            // 1. Inscripción solicitada
            const eventoInscripcion = new InscripcionSolicitadaEvent(
                inscripcionId,
                usuarioId,
                cursoId,
                new Date(),
                true,
                199.99,
                'tarjeta_credito'
            );
            await this.eventPublisher.publicarEvento(eventoInscripcion);
            resultados.eventosPublicados.push({
                tipo: 'InscripcionSolicitada',
                eventId: eventoInscripcion.eventId,
                timestamp: eventoInscripcion.timestamp
            });

            // Simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Pago realizado
            const eventoPago = new PagoRealizadoEvent(
                uuidv4(),
                usuarioId,
                199.99,
                'tarjeta_credito',
                [cursoId]
            );
            await this.eventPublisher.publicarEvento(eventoPago);
            resultados.eventosPublicados.push({
                tipo: 'PagoRealizado',
                eventId: eventoPago.eventId,
                timestamp: eventoPago.timestamp
            });

            // 3. Inscripción confirmada
            const eventoConfirmacion = new InscripcionConfirmadaEvent(
                inscripcionId,
                usuarioId,
                cursoId,
                new Date()
            );
            await this.eventPublisher.publicarEvento(eventoConfirmacion);
            resultados.eventosPublicados.push({
                tipo: 'InscripcionConfirmada',
                eventId: eventoConfirmacion.eventId,
                timestamp: eventoConfirmacion.timestamp
            });

            // 4. Curso completado
            const eventoCursoCompletado = new CursoCompletadoEvent(
                usuarioId,
                cursoId,
                9.5,
                new Date(),
                true
            );
            await this.eventPublisher.publicarEvento(eventoCursoCompletado);
            resultados.eventosPublicados.push({
                tipo: 'CursoCompletado',
                eventId: eventoCursoCompletado.eventId,
                timestamp: eventoCursoCompletado.timestamp
            });

            this.logger.log('✅ Flujo completo ejecutado exitosamente');

            return {
                success: true,
                mensaje: 'Flujo de inscripción completo ejecutado con Event Sourcing y proyecciones',
                datos: resultados,
                instrucciones: 'Consulta los endpoints de métricas para ver los datos actualizados en tiempo real'
            };

        } catch (error) {
            this.logger.error('❌ Error en demostración:', error);
            return {
                success: false,
                error: error.message,
                datos: resultados
            };
        }
    }
}
