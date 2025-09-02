import { DomainEvent } from '../domain-event.base';

export class InscripcionFallidaEvent extends DomainEvent {
  constructor(
    public readonly inscripcionId: string,
    public readonly error: string
  ) {
    super();
  }
}
