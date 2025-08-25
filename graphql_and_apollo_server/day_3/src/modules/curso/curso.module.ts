import { AppModule } from "src/app.module";
import { ChatService } from "./services/chat.service";
import { AuthService } from "./services/auth.service";
import { CursoService } from "./services/curso.service";
import { Module, forwardRef, Logger } from "@nestjs/common";
import { LeccionService } from "./services/leccion.service";
import { UsuarioService } from "./services/usuario.service";
import { ProgresoService } from "./services/progreso.service";
import { CursoResolver } from "./graphql/resolvers/curso.resolver";
import { ChatResolver } from "./graphql/resolvers/chat/chat.resolver";
import { EstadisticasService } from "./services/estadisticas.service";
import { UsuarioResolver } from "./graphql/resolvers/usuario.resolver";
import { LeccionResolver } from "./graphql/resolvers/leccion.resolver";
import { ProgresoResolver } from "./graphql/resolvers/progreso.resolver";
import { EventPublisherService } from "./services/event-publisher.service";
import { WebSocketConnectionManager } from "./services/websocket-connection.service";
import { ELearningDataLoaderSystem } from "./dataloaders/elearning-dataloader.system";
import { ChatNotificacionResolver } from "./graphql/resolvers/chat/chat-notificacion.resolver";
import { CursoNotificationResolver } from "./graphql/resolvers/notifications/curso-notification.resolver";

@Module({
    imports: [forwardRef(() => AppModule)],
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
        EstadisticasService,
        EventPublisherService,
        ChatNotificacionResolver,
        CursoNotificationResolver,
        ELearningDataLoaderSystem,
        WebSocketConnectionManager,
    ],
    exports: [
        ChatService,
        AuthService,
        CursoService,
        LeccionService,
        UsuarioService,
        ProgresoService,
        EstadisticasService,
        EventPublisherService,
        WebSocketConnectionManager
    ],
})
export class CursoModule { }