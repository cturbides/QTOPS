import { Module } from '@nestjs/common';
import { CursoService } from './services/curso.service';
import { CursoResolver } from './graphql/resolvers/curso.resolver';
import { EstadisticasService } from './services/estadisticas.service';
import { UsuarioResolver } from './graphql/resolvers/usuario.resolver';

@Module({
    providers: [
        CursoService,
        CursoResolver,
        UsuarioResolver,
        EstadisticasService,
    ],
    exports: [CursoService, EstadisticasService],
})
export class CursoModule { }
