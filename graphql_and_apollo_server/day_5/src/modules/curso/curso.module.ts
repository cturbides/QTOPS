import { AppModule } from "src/app.module";
import { ChatService } from "./services/chat.service";
import { AuthService } from "./services/auth.service";
import { CursoService } from "./services/curso.service";
import { Module, forwardRef, Logger } from "@nestjs/common";
import { LeccionService } from "./services/leccion.service";
import { UsuarioService } from "./services/usuario.service";
import { ProgresoService } from "./services/progreso.service";
import { MensajeVozService } from "./services/mensaje-voz.service";
import { CursoResolver } from "./graphql/resolvers/curso.resolver";
import { SalaPrivadaService } from "./services/sala-privada.service";
import { ChatResolver } from "./graphql/resolvers/chat/chat.resolver";
import { EstadisticasService } from "./services/estadisticas.service";
import { UsuarioResolver } from "./graphql/resolvers/usuario.resolver";
import { LeccionResolver } from "./graphql/resolvers/leccion.resolver";
import { ProgresoResolver } from "./graphql/resolvers/progreso.resolver";
import { EventPublisherService } from "./services/event-publisher.service";
import { WebSocketConnectionManager } from "./services/websocket-connection.service";
import { SalaPrivadaResolver } from "./graphql/resolvers/chat/sala-privada.resolver";
import { ELearningDataLoaderSystem } from "./dataloaders/elearning-dataloader.system";
import { SincronizacionEstadoService } from "./services/sincronizacion-estado.service";
import { ChatNotificacionResolver } from "./graphql/resolvers/chat/chat-notificacion.resolver";
import { CursoNotificationResolver } from "./graphql/resolvers/notifications/curso-notification.resolver";
import { SalaPrivadaNotificacionResolver } from "./graphql/resolvers/chat/sala-privada-notificacion.resolver";

import { JwtModule } from '@nestjs/jwt';
import { AuditResolver } from "./graphql/resolvers/audit.resolver";
import { GraphQLRoleGuard } from "./graphql/guards/graphql-role.guard";
import { GraphQLAuthService } from "./services/security/graphql-auth.service";
import { AuditLoggingService } from "./services/security/audit-logging.service";
import { GraphQLSecurityService } from "./services/security/graphql-security.service";
import { GraphQLRateLimitService } from "./services/security/graphql-rate-limit.service";
import { GraphQLSecurityMiddleware } from "./services/security/graphql-security-middleware.service";

@Module({
    imports: [
        forwardRef(() => AppModule),
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: process.env.EXPIRES_IN_TIME ?? '1h' },
        })
    ],
    providers: [
        Logger,
        ChatService,
        AuthService,
        ChatResolver,
        CursoService,
        CursoResolver,
        LeccionService,
        UsuarioService,
        ProgresoService,
        LeccionResolver,
        UsuarioResolver,
        ProgresoResolver,
        MensajeVozService,
        SalaPrivadaService,
        SalaPrivadaResolver,
        EstadisticasService,
        EventPublisherService,
        ChatNotificacionResolver,
        CursoNotificationResolver,
        ELearningDataLoaderSystem,
        WebSocketConnectionManager,
        SincronizacionEstadoService,
        SalaPrivadaNotificacionResolver,

        GraphQLRoleGuard,
        GraphQLAuthService,
        GraphQLSecurityService,
        GraphQLRateLimitService,
        GraphQLSecurityMiddleware,
        AuditLoggingService,
        AuditResolver,
    ],
    exports: [
        ChatService,
        AuthService,
        CursoService,
        LeccionService,
        UsuarioService,
        ProgresoService,
        MensajeVozService,
        SalaPrivadaService,
        EstadisticasService,
        EventPublisherService,
        WebSocketConnectionManager,
        SincronizacionEstadoService,

        // Servicios de seguridad
        GraphQLAuthService,
        AuditLoggingService,
        GraphQLSecurityService,
        GraphQLRateLimitService,
        GraphQLSecurityMiddleware,
    ],
})
export class CursoModule { }