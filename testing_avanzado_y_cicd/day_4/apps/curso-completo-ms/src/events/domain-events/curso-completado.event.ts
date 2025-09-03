import { DomainEvent } from '../domain-event.base';

export class CursoCompletadoEvent extends DomainEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly cursoId: string,
    public readonly calificacionFinal: number,
    public readonly fechaFinalizacion: Date,
    public readonly certificadoGenerado: boolean
  ) {
    super();
  }
}
