import { Curso } from '@modules/curso/graphql/types/curso.model';
import { CursoService } from '@modules/curso/services/curso.service';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { CrearCursoInput } from '@modules/curso/graphql/inputs/crear-curso.input';
import { EstadisticasService } from '@modules/curso/services/estadisticas.service';
import { EstadisticasCurso } from '@modules/curso/graphql/types/estadisticas-curso.model';
import { InscribirEnCursoArgs } from '@modules/curso/graphql/args/inscribir-en-curso.args';
import type { GraphQLContextWithLoaders } from '@modules/curso/graphql/common/context-with-loader'; 
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver, Context } from '@nestjs/graphql';
import { GenericResponseMessage } from '@modules/curso/graphql/types/generic/response-message.model';

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
    async lecciones(
        @Parent() curso: Curso,
        @Context() context: GraphQLContextWithLoaders
    ): Promise<Leccion[]> {
        return context.loaders.leccion.load(curso.id);
    }

    @ResolveField(() => Usuario, { name: 'instructor' })
    async instructor(
        @Parent() curso: Curso,
        @Context() context: GraphQLContextWithLoaders
    ): Promise<Usuario> {
        const usuario = await context.loaders.usuario.load(curso.instructor.id);

        if (!usuario) {
            throw new Error(`Instructor con ID ${curso.instructor.id} no encontrado`);
        }

        return usuario;
    }

    @ResolveField(() => EstadisticasCurso, { name: 'estadisticas' })
    async estadisticas(
        @Parent() curso: Curso,
    ): Promise<EstadisticasCurso> {
        return this.estadisticasService.calcularParaCurso(curso.id);
    }

    @Mutation(() => GenericResponseMessage, { name: 'inscribirEnCurso' })
    async inscribirEnCurso(
        @Args() { cursoId, estudianteId }: InscribirEnCursoArgs
    ): Promise<GenericResponseMessage> {
        return this.cursoService.inscribir(cursoId, estudianteId);
    }
}
