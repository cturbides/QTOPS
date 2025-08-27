import { MetadatosAudio } from "@modules/curso/entities/chat/mensaje-voz.entity";

export interface EnviarMensajeVozDto {
    usuarioId: string;
    cursoId?: string;
    salaId?: string;
    duracion: number;
    urlAudio: string;
    transcripcion?: string;
    metadatos: MetadatosAudio;
    respondePor?: string;
}
