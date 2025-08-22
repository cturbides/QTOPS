import { AppModule } from 'src/app.module';
import { Module, forwardRef } from '@nestjs/common';
import { CursoService } from './services/curso.service';
import { CursoResolver } from './graphql/resolvers/curso.resolver';
import { EstadisticasService } from './services/estadisticas.service';
import { UsuarioResolver } from './graphql/resolvers/usuario.resolver';
import { CursoNotificationResolver } from "./graphql/resolvers/notifications/curso-notification.resolver";

@Module({
    imports: [forwardRef(() => AppModule)],
    providers: [
        CursoService,
        CursoResolver,
        UsuarioResolver,
        EstadisticasService,
        CursoNotificationResolver,
    ],
    exports: [CursoService, EstadisticasService],
})
export class CursoModule { }
