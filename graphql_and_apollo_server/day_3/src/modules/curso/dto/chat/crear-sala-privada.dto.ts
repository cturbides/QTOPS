import { TipoSala, ConfiguracionSala } from "@modules/curso/entities/chat/sala-privada.entity";

export interface CrearSalaPrivadaDto {
    nombre: string;
    descripcion?: string;
    tipo: TipoSala;
    creadorId: string;
    participantesIds: string[];
    configuracion: ConfiguracionSala;
}
