import { Usuario } from "@modules/curso/entities/usuario.entity";

export enum Estado {
    ONLINE = 'ONLINE',
    AUSENTE = 'AUSENTE',
    OCUPADO = 'OCUPADO',
    INVISIBLE = 'INVISIBLE'
}

export type EstadoUsuario = {
    estado: Estado;
    cursoId: string;
    usuario: Usuario;
    ultimaConexion: Date;
};