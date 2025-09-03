import { Injectable, Logger } from '@nestjs/common';
import { InscripcionProjectionService } from './inscripcion-projection.service';
import { DomainEvent } from '../domain-event.base';

// Eventos
import { InscripcionSolicitadaEvent } from '../domain-events/inscripcion-solicitada.event';
import { InscripcionConfirmadaEvent } from '../domain-events/inscripcion-confirmada.event';
import { InscripcionRechazadaEvent } from '../domain-events/inscripcion-rechazada.event';
import { PagoRealizadoEvent } from '../domain-events/pago-realizado.event';
import { CursoCompletadoEvent } from '../domain-events/curso-completado.event';

@Injectable()
export class ProjectionEventHandler {
  constructor(
    private readonly logger: Logger,
    private readonly projectionService: InscripcionProjectionService
  ) {}

  async manejarEvento(evento: DomainEvent): Promise<void> {
    this.logger.log(`🔄 Procesando evento para proyección: ${evento.constructor.name}`);

    try {
      switch (evento.constructor) {
        case InscripcionSolicitadaEvent:
          await this.projectionService.procesarInscripcionSolicitada(evento as InscripcionSolicitadaEvent);
          break;

        case InscripcionConfirmadaEvent:
          await this.projectionService.procesarInscripcionConfirmada(evento as InscripcionConfirmadaEvent);
          break;

        case InscripcionRechazadaEvent:
          await this.projectionService.procesarInscripcionRechazada(evento as InscripcionRechazadaEvent);
          break;

        case PagoRealizadoEvent:
          await this.projectionService.procesarPagoRealizado(evento as PagoRealizadoEvent);
          break;

        case CursoCompletadoEvent:
          await this.projectionService.procesarCursoCompletado(evento as CursoCompletadoEvent);
          break;

        default:
          this.logger.debug(`Evento no relevante para proyección: ${evento.constructor.name}`);
          return;
      }

      this.logger.log(`✅ Evento procesado exitosamente en proyección: ${evento.constructor.name}`);
    } catch (error) {
      this.logger.error(`❌ Error procesando evento en proyección: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reprocessarEventos(eventos: DomainEvent[]): Promise<void> {
    this.logger.log(`🔄 Reprocesando ${eventos.length} eventos para proyección`);

    for (const evento of eventos) {
      try {
        await this.manejarEvento(evento);
      } catch (error) {
        this.logger.error(`❌ Error reprocesando evento ${evento.eventId}: ${error.message}`);
      }
    }

    this.logger.log(`✅ Reprocesamiento de eventos completado`);
  }
}
