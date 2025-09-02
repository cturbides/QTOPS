import { DomainEvent } from '../domain-event.base';

export class PagoRealizadoEvent extends DomainEvent {
  constructor(
    public readonly pagoId: string,
    public readonly usuarioId: string,
    public readonly monto: number,
    public readonly metodoPago: string,
    public readonly cursosAdquiridos: string[]
  ) {
    super();
  }
}
