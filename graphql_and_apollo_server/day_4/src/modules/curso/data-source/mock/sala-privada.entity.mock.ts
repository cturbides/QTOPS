import { mockUsuarios } from "./usuario.entity.mock";
import { SalaPrivada, TipoSala } from "@modules/curso/entities/chat/sala-privada.entity";

export const mockSalasPrivadas: SalaPrivada[] = [
    {
        id: "sala_1",
        nombre: "Proyecto Frontend",
        descripcion: "Discusión del proyecto de desarrollo frontend",
        tipo: TipoSala.GRUPO,
        creador: mockUsuarios[0],
        participantes: [mockUsuarios[0], mockUsuarios[1]],
        fechaCreacion: new Date('2024-01-15T10:00:00'),
        ultimaActividad: new Date(),
        configuracion: {
            mensajesVozPermitidos: true,
            notificacionesSonido: true,
            limiteMensajes: 1000,
            archivoCompartido: true
        }
    },
    {
        id: "sala_2",
        nombre: "Chat Privado",
        descripcion: "Conversación privada entre desarrolladores",
        tipo: TipoSala.PRIVADA,
        creador: mockUsuarios[1],
        participantes: [mockUsuarios[1], mockUsuarios[2]],
        fechaCreacion: new Date('2024-01-20T14:30:00'),
        ultimaActividad: new Date(),
        configuracion: {
            mensajesVozPermitidos: true,
            notificacionesSonido: false,
            archivoCompartido: true
        }
    }
];
