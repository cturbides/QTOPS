import { TipoMensaje } from "@modules/curso/entities/chat/tipo-mensaje.enum";
import { ArchivoAdjunto } from "@modules/curso/entities/chat/archivo-adjunto.type";
import { MensajeVoz } from "@modules/curso/entities/chat/mensaje-voz.entity";

export interface CrearMensajeDto {
    cursoId?: string;
    salaId?: string;
    autorId: string;
    contenido: string;
    tipo: TipoMensaje;
    adjuntos?: ArchivoAdjunto[];
    mensajeVoz?: MensajeVoz;
    respondePor?: string;
}
