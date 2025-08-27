import { mockCursos } from "./mock/curso.entity.mock";
import { generateId } from "./utils/generate-id.util";
import { mockLecciones } from "./mock/leccion.entity.mock";
import { mockSalasPrivadas } from "./mock/sala-privada.entity.mock";
import { MensajeChat } from "@modules/curso/entities/mensaje-chat.entity";
import { mockUsuarios, mockUsuariosPorJWT } from "./mock/usuario.entity.mock";
import { SalaPrivada } from "@modules/curso/entities/chat/sala-privada.entity";
import { mockProgresoEstudiante } from "./mock/progreso-estudiante.entity.mock";
import { EstadoUsuario } from "@modules/curso/entities/chat/estado-usuario.type";
import { mockHistorialEstudiante } from "./mock/historial-estudiante.entity.mock";
import { SincronizacionEstado } from "@modules/curso/entities/chat/sincronizacion-estado.entity";
import { IConnectionInfo } from "@modules/curso/services/interfaces/websocket/connection-info.interface";
import { AuditLogEntry } from "@modules/curso/entities/audit/audit-log.entity";

// Dummy data source
export const dataSource = {
    cursos: mockCursos,
    generateId: generateId,
    usuarios: mockUsuarios,
    lecciones: mockLecciones,
    progresoEstudiante: mockProgresoEstudiante,
    historialEstudiante: mockHistorialEstudiante,

    // Chat
    usuariosConCursos: new Map([
        [mockUsuarios[0].id, [mockCursos[0].id]],
        [mockUsuarios[1].id, [mockCursos[0].id, mockCursos[1].id]],
    ]),
    usuariosPorJWT: mockUsuariosPorJWT,
    mensajes: new Map<string, MensajeChat>(),
    mensajesPorCurso: new Map<string, string[]>(),
    presenciaUsuarios: new Map<string, EstadoUsuario>(),
    conexionesActivas: new Map<string, IConnectionInfo>(),
    timeoutsEscritura: new Map<string, NodeJS.Timeout>(),
    usuariosEscribiendoMap: new Map<string, Set<string>>(),

    // Salas privadas
    salasPrivadas: new Map<string, SalaPrivada>(
        mockSalasPrivadas.map(sala => [sala.id, sala])
    ),
    mensajesPorSala: new Map<string, string[]>(),
    participantesPorSala: new Map<string, Set<string>>(
        mockSalasPrivadas.map(sala => [
            sala.id, 
            new Set(sala.participantes.map(p => p.id))
        ])
    ),
    salasPorUsuario: new Map<string, Set<string>>([
        [mockUsuarios[0].id, new Set(['sala_1'])],
        [mockUsuarios[1].id, new Set(['sala_1', 'sala_2'])],
        [mockUsuarios[2].id, new Set(['sala_2'])]
    ]),

    // Sincronización de estado
    sincronizacionEstados: new Map<string, SincronizacionEstado>(),
    eventosPendientesPorUsuario: new Map<string, string[]>(),
    historialEventos: new Map<string, any[]>(),

    // Security
    rateLimitStorage: new Map<string, any>(),
    
    // Audit Logging
    auditLogs: [] as AuditLogEntry[],
}