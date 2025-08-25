import { Provider } from "@nestjs/common";
import { CursoService } from "./curso.service";
import { LeccionService } from "./leccion.service";
import { UsuarioService } from "./usuario.service";
import { ProgresoService } from "./progreso.service";
import { EstadisticasService } from "./estadisticas.service";
import { ChatService } from "./chat.service";
import { AuthService } from "./auth.service";
import { EventPublisherService } from "./event-publisher.service";
import { WebSocketConnectionManager } from "./websocket-connection.service";

export const CURSO_SERVICES: Provider[] = [
    CursoService,
    LeccionService,
    UsuarioService,
    ProgresoService,
    EstadisticasService,
    ChatService,
    AuthService,
    EventPublisherService,
    WebSocketConnectionManager
];

export const CURSO_SERVICES_MAP = {
    cursoService: CursoService,
    usuarioService: UsuarioService,
    leccionService: LeccionService,
    progresoService: ProgresoService,
    chatService: ChatService,
    authService: AuthService,
    eventPublisherService: EventPublisherService,
    webSocketConnectionManager: WebSocketConnectionManager
}