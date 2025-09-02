import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainEvent } from '../domain-event.base';
import { EventStoreEntry } from '../entities/event-store-entry.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(EventStoreEntry)
    private readonly eventRepository: Repository<EventStoreEntry>
  ) { }

  async guardarEvento(evento: DomainEvent, aggregateId: string): Promise<void> {
    const entrada = new EventStoreEntry();
    entrada.eventId = evento.eventId;
    entrada.aggregateId = aggregateId;
    entrada.eventType = evento.constructor.name;
    entrada.eventData = JSON.stringify(evento);
    entrada.timestamp = evento.timestamp;
    entrada.version = await this.obtenerSiguienteVersion(aggregateId);

    await this.eventRepository.save(entrada);
  }

  async obtenerEventos(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .orderBy('event.version', 'ASC');

    if (fromVersion) {
      query.andWhere('event.version >= :fromVersion', { fromVersion });
    }

    const entradas = await query.getMany();

    return entradas.map(entrada =>
      this.deserializarEvento(entrada.eventType, entrada.eventData)
    );
  }

  async reconstruirAgregado<T>(
    aggregateId: string,
    AggregateClass: new () => T,
    toVersion?: number
  ): Promise<T> {
    const eventos = await this.obtenerEventos(aggregateId);
    const agregado = new AggregateClass();

    for (const evento of eventos) {
      if (toVersion && evento.version > toVersion) break;

      const methodName = `apply${evento.constructor.name}`;
      if (typeof agregado[methodName] === 'function') {
        agregado[methodName](evento);
      }
    }

    return agregado;
  }

  private async obtenerSiguienteVersion(aggregateId: string): Promise<number> {
    const resultado = await this.eventRepository
      .createQueryBuilder('event')
      .select('MAX(event.version)', 'maxVersion')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .getRawOne();

    return (resultado?.maxVersion || 0) + 1;
  }

  private deserializarEvento(eventType: string, eventData: string): DomainEvent {
    try {
      return JSON.parse(eventData);
    } catch (error) {
      throw new Error(`Error deserializando evento ${eventType}: ${error.message}`);
    }
  }
}
