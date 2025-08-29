import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../domain-event.base';
import { EventStoreService } from './event-store.service';
import { EventHandler } from '../types/event-handler.type';
import { MessageBrokerService } from '../interfaces/message-broker.interface';
import { EventPublicationException } from '../exceptions/event-publication.exception';

@Injectable()
export class DomainEventPublisher {
  private readonly eventHandlers: EventHandler[] = [];

  constructor(
    private readonly eventStore: EventStoreService,
    private readonly messageBroker: MessageBrokerService,
  ) { }

  async publicarEvento<T extends DomainEvent>(evento: T, aggregateId?: string): Promise<void> {
    try {
      // 1. Persistir evento en event store para auditoría
      if (aggregateId) {
        await this.eventStore.guardarEvento(evento, aggregateId);
      }

      // 2. Ejecutar manejadores locales (proyecciones, etc.)
      await this.procesarManejadoresLocales(evento);

      // 3. Publicar evento en message broker para procesamiento distribuido
      await this.messageBroker.publicarEvento({
        exchange: 'domain-events',
        routingKey: this.generarRoutingKey(evento),
        message: {
          eventType: evento.constructor.name,
          eventId: evento.eventId,
          timestamp: evento.timestamp,
          payload: evento
        },
        options: {
          persistent: true,
          mandatory: true
        }
      });

      console.log(`Evento publicado: ${evento.constructor.name} - ${evento.eventId}`);

    } catch (error) {
      await this.manejarErrorPublicacion(evento, error);
      throw new EventPublicationException(
        `Error publicando evento ${evento.constructor.name}: ${error.message}`
      );
    }
  }

  suscribirseATodosLosEventos(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  private async procesarManejadoresLocales(evento: DomainEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(evento);
      } catch (error) {
        console.error(`Error en manejador local para evento ${evento.constructor.name}:`, error);
        // No lanzamos el error para no afectar la publicación principal
      }
    }
  }

  private generarRoutingKey(evento: DomainEvent): string {
    const eventType = evento.constructor.name;
    const domain = this.extraerDominio(eventType);
    return `${domain}.${eventType.toLowerCase()}`;
  }

  private extraerDominio(eventType: string): string {
    if (eventType.includes('Usuario')) return 'user';
    if (eventType.includes('Curso')) return 'course';
    if (eventType.includes('Pago')) return 'payment';
    if (eventType.includes('Inscripcion')) return 'enrollment';
    return 'general';
  }

  private async manejarErrorPublicacion(evento: DomainEvent, error: any): Promise<void> {
    console.error(`Error publicando evento ${evento.constructor.name}:`, error);
    // Aquí se podría implementar lógica adicional como:
    // - Guardar en una cola de errores
    // - Notificar a sistemas de monitoreo
    // - Implementar reintentos
  }
}
