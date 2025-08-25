import { Usuario } from "./usuario.entity";
import { TipoNotificacion } from "./notificacion/tipo-notificacion.enum";

export type Notificacion = {
    id: string;
    mensaje: string;
    metadatos?: string;
    fechaCreacion: Date;
    destinatario: Usuario;
    tipo: TipoNotificacion;
};
