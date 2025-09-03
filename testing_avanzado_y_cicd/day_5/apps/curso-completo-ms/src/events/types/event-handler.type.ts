import { DomainEvent } from '../domain-event.base';

export type EventHandler = (evento: DomainEvent) => Promise<void>;