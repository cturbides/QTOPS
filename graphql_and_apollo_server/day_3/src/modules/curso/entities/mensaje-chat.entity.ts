import { Usuario } from './usuario.entity';
import { TipoMensaje } from './chat/tipo-mensaje.enum';
import { ArchivoAdjunto } from './chat/archivo-adjunto.type';
import { MensajeVoz } from './chat/mensaje-voz.entity';

export type MensajeChat = {
  id: string;
  autor: Usuario;
  cursoId: string;
  salaId?: string; // Para mensajes en salas privadas
  fechaEnvio: Date;
  editado: boolean;
  contenido: string;
  tipo: TipoMensaje;
  fechaEdicion?: Date;
  adjuntos?: ArchivoAdjunto[];
  mensajeVoz?: MensajeVoz; // Para mensajes de voz
  respondePor?: string; // ID del mensaje al que responde (threading)
};
