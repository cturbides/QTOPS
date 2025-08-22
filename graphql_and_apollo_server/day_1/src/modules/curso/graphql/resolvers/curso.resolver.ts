import { Curso } from '@modules/curso/graphql/types/curso.model';
import { CursoService } from '@modules/curso/services/curso.service';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { CrearCursoInput } from '@modules/curso/graphql/inputs/crear-curso.input';
import { EstadisticasService } from '@modules/curso/services/estadisticas.service';
import { EstadisticasCurso } from '@modules/curso/graphql/types/estadisticas-curso.model';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => Curso)
export class CursoResolver {
    constructor(
        private readonly cursoService: CursoService,
        private readonly estadisticasService: EstadisticasService
    ) { }

    @Query(() => Curso, { name: 'curso' })
    async curso(@Args('id', { type: () => ID }) id: string): Promise<Curso> {
        return this.cursoService.obtenerCompleto(id);
    }

    @Query(() => [Curso], { name: 'cursos' })
    async cursos(): Promise<Curso[]> {
        return this.cursoService.obtenerTodosLosCursos();
    }

    @Mutation(() => Curso, { name: 'crearCurso' })
    async crearCurso(
        @Args('datos') datos: CrearCursoInput,
    ): Promise<Curso> {
        return this.cursoService.crear(datos);
    }

    @ResolveField(() => [Leccion], { name: 'lecciones' })
    async lecciones(@Parent() curso: Curso): Promise<Leccion[]> {
        return this.cursoService.obtenerLecciones(curso.id);
    }

    @ResolveField(() => Usuario, { name: 'instructor' })
    async instructor(@Parent() curso: Curso): Promise<Usuario> {
        return this.cursoService.obtenerInstructor(curso.instructor.id);
    }

    @ResolveField(() => EstadisticasCurso, { name: 'estadisticas' })
    async estadisticas(@Parent() curso: Curso): Promise<EstadisticasCurso> {
        return this.estadisticasService.calcularParaCurso(curso.id);
    }
}
