import { AppModule } from 'src/app.module';
import { Module, forwardRef } from '@nestjs/common';
import { CursoService } from './services/curso.service';
import { LeccionService } from "./services/leccion.service";
import { UsuarioService } from './services/usuario.service';
import { ProgresoService } from './services/progreso.service';
import { CursoResolver } from './graphql/resolvers/curso.resolver';
import { EstadisticasService } from './services/estadisticas.service';
import { UsuarioResolver } from './graphql/resolvers/usuario.resolver';
import { LeccionResolver } from './graphql/resolvers/leccion.resolver';
import { ProgresoResolver } from './graphql/resolvers/progreso.resolver';
import { ELearningDataLoaderSystem } from "./dataloaders/elearning-dataloader.system";
import { CursoNotificationResolver } from "./graphql/resolvers/notifications/curso-notification.resolver";

@Module({
    imports: [forwardRef(() => AppModule)],
    providers: [
        CursoService,
        CursoResolver,
        LeccionService,
        UsuarioService,
        ProgresoService,
        LeccionResolver,
        UsuarioResolver,
        ProgresoResolver,
        EstadisticasService,
        CursoNotificationResolver,
        ELearningDataLoaderSystem,
    ],
    exports: [CursoService, EstadisticasService, LeccionService, UsuarioService, ProgresoService],
})
export class CursoModule { }