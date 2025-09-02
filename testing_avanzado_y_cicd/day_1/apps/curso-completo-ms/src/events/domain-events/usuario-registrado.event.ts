import { DomainEvent } from '../domain-event.base';
import { TipoUsuario } from '../enums/tipo-usuario.enum';

export class UsuarioRegistradoEvent extends DomainEvent {
  constructor(
    public readonly usuarioId: string,
    public readonly email: string,
    public readonly tipoUsuario: TipoUsuario,
    public readonly perfilCompleto: boolean
  ) {
    super();
  }
}
