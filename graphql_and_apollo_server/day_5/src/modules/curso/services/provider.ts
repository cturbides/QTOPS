import { Provider } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthService } from "./auth.service";
import { CursoService } from "./curso.service";
import { LeccionService } from "./leccion.service";
import { UsuarioService } from "./usuario.service";
import { ProgresoService } from "./progreso.service";
import { GraphQLAuthService } from "./security/graphql-auth.service";
import { EstadisticasService } from "./estadisticas.service";
import { EventPublisherService } from "./event-publisher.service";
import { GraphQLSecurityService } from "./security/graphql-security.service";
import { GraphQLRateLimitService } from "./security/graphql-rate-limit.service";
import { WebSocketConnectionManager } from "./websocket-connection.service";
import { GraphQLSecurityMiddleware } from "./security/graphql-security-middleware.service";

export const CURSO_SERVICES: Provider[] = [
    ChatService,
    AuthService,
    CursoService,
    LeccionService,
    UsuarioService,
    ProgresoService,
    GraphQLAuthService,
    EstadisticasService,
    EventPublisherService,
    GraphQLSecurityService,
    GraphQLRateLimitService,
    GraphQLSecurityMiddleware,
    WebSocketConnectionManager,
];

export const CURSO_SERVICES_MAP = {
    chatService: ChatService,
    authService: AuthService,
    cursoService: CursoService,
    usuarioService: UsuarioService,
    leccionService: LeccionService,
    progresoService: ProgresoService,
    graphqlAuthService: GraphQLAuthService,
    eventPublisherService: EventPublisherService,
    graphqlSecurityService: GraphQLSecurityService,
    graphqlRateLimitService: GraphQLRateLimitService,
    graphqlSecurityMiddleware: GraphQLSecurityMiddleware,
    webSocketConnectionManager: WebSocketConnectionManager,
}