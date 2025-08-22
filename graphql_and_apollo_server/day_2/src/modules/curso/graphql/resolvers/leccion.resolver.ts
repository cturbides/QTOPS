import { Query, Resolver, Args } from '@nestjs/graphql';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { LeccionService } from '@modules/curso/services/leccion.service';

@Resolver(() => Leccion)
export class LeccionResolver {
    constructor(private readonly leccionService: LeccionService) { }

    @Query(() => [Leccion], { name: 'lecciones' })
    async obtenerLeccionesPorCurso(@Args('cursoId', { type: () => String }) cursoId: string): Promise<Leccion[]> {
        return this.leccionService.obtenerPorCurso(cursoId);
    }

    @Query(() => [Leccion], { name: 'leccionesPorCursosEnOrden' })
    async obtenerLeccionesPorCursosEnOrden(@Args('cursoIds', { type: () => [String] }) cursoIds: string[]): Promise<Leccion[]> {
        return this.leccionService.obtenerPorCursosConOrden(cursoIds);
    }
}
