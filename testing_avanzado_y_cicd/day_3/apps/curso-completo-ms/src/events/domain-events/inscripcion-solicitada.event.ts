import { DomainEvent } from '../domain-event.base';

export class InscripcionSolicitadaEvent extends DomainEvent {
  constructor(
    public readonly inscripcionId: string,
    public readonly usuarioId: string,
    public readonly cursoId: string,
    public readonly fechaInicio: Date,
    public readonly requierePago: boolean,
    public readonly monto?: number,
    public readonly metodoPago?: string
  ) {
    super();
  }
}
