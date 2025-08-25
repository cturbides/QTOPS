import { TipoMensaje } from "@modules/curso/entities/chat/tipo-mensaje.enum";
import { ArchivoAdjunto } from "@modules/curso/entities/chat/archivo-adjunto.type";

export interface CrearMensajeDto {
    cursoId: string;
    autorId: string;
    contenido: string;
    tipo: TipoMensaje;
    adjuntos?: ArchivoAdjunto[];
}
