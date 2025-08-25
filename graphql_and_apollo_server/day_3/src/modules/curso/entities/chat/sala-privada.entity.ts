import { Usuario } from '../usuario.entity';

export enum TipoSala {
    GRUPO = 'GRUPO',
    PRIVADA = 'PRIVADA',
}

export type SalaPrivada = {
    id: string;
    nombre: string;
    tipo: TipoSala;
    creador: Usuario;
    fechaCreacion: Date;
    descripcion?: string;
    ultimaActividad: Date;
    participantes: Usuario[];
    configuracion: ConfiguracionSala;
};

export type ConfiguracionSala = {
    limiteMensajes?: number;
    archivoCompartido: boolean;
    notificacionesSonido: boolean;
    mensajesVozPermitidos: boolean;
};
