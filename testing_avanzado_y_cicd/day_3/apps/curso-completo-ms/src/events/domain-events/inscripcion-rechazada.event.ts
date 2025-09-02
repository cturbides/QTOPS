import { DomainEvent } from '../domain-event.base';

export class InscripcionRechazadaEvent extends DomainEvent {
  constructor(
    public readonly inscripcionId: string,
    public readonly razon: string
  ) {
    super();
  }
}
