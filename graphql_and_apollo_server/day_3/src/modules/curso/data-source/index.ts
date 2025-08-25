import { mockCursos } from "./mock/curso.entity.mock";
import { generateId } from "./utils/generate-id.util";
import { mockLecciones } from "./mock/leccion.entity.mock";
import { MensajeChat } from "@modules/curso/entities/mensaje-chat.entity";
import { mockUsuarios, mockUsuariosPorJWT } from "./mock/usuario.entity.mock";
import { mockProgresoEstudiante } from "./mock/progreso-estudiante.entity.mock";
import { EstadoUsuario } from "@modules/curso/entities/chat/estado-usuario.type";
import { mockHistorialEstudiante } from "./mock/historial-estudiante.entity.mock";
import { IConnectionInfo } from "@modules/curso/services/interfaces/websocket/connection-info.interface";

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
}