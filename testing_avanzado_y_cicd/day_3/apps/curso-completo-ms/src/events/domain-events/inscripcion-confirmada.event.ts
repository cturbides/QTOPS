import { DomainEvent } from '../domain-event.base';

export class InscripcionConfirmadaEvent extends DomainEvent {
  constructor(
    public readonly inscripcionId: string,
    public readonly usuarioId: string,
    public readonly cursoId: string,
    public readonly fechaConfirmacion: Date
  ) {
    super();
  }
}
