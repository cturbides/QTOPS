import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../domain-event.base';
import { EventFactory } from './event-factory.service';
import { MessageWrapper } from '../wrappers/message.wrapper';
import { MessageBrokerService } from '../interfaces/message-broker.interface';

@Injectable()
export abstract class DomainEventSubscriber<T extends DomainEvent> {
  constructor(
    protected readonly eventFactory: EventFactory,
    protected readonly messageBroker: MessageBrokerService,
  ) { }

  abstract manejarEvento(evento: T): Promise<void>;
  abstract obtenerEventosInteres(): string[];

  async inicializarSuscripcion(): Promise<void> {
    const eventosInteres = this.obtenerEventosInteres();

    for (const tipoEvento of eventosInteres) {
      await this.messageBroker.crearConsumidor({
        queue: `${this.constructor.name.toLowerCase()}-${tipoEvento}`,
        exchange: 'domain-events',
        routingKey: `*.${tipoEvento.toLowerCase()}`,
        handler: async (mensaje: MessageWrapper) => {
          try {
            console.log(`Procesando evento: ${mensaje.content.eventType}`, mensaje.content.payload);

            // Usar factory para deserializar correctamente el evento
            const evento = this.eventFactory.crearEvento(mensaje.content.eventType, mensaje.content.payload);
            await this.manejarEvento(evento as T);

            mensaje.ack();

          } catch (error) {
            console.error(`Error procesando evento ${tipoEvento}:`, error);

            if (mensaje.originalMessage?.fields?.redelivered &&
              mensaje.originalMessage?.properties?.headers?.['x-retry-count'] > 3) {
              mensaje.nack(false, false);
            } else {
              setTimeout(() => mensaje.nack(false, true), 2000);
            }
          }
        }
      });
    }
  }
}
