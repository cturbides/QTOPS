import { Usuario } from './usuario.entity';
import { TipoMensaje } from './chat/tipo-mensaje.enum';
import { ArchivoAdjunto } from './chat/archivo-adjunto.type';

export type MensajeChat = {
  id: string;
  autor: Usuario;
  cursoId: string;
  fechaEnvio: Date;
  editado: boolean;
  contenido: string;
  tipo: TipoMensaje;
  fechaEdicion?: Date;
  adjuntos?: ArchivoAdjunto[];
};
