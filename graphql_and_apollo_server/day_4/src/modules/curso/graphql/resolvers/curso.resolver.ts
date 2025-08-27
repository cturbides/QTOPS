import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Curso } from '@modules/curso/graphql/types/curso.model';
import { CursoService } from '@modules/curso/services/curso.service';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { CrearCursoInput } from '@modules/curso/graphql/inputs/crear-curso.input';
import { EstadisticasService } from '@modules/curso/services/estadisticas.service';
import { GraphQLRoleGuard } from '@modules/curso/graphql/guards/graphql-role.guard';
import { EstadisticasCurso } from '@modules/curso/graphql/types/estadisticas-curso.model';
import { InscribirEnCursoArgs } from '@modules/curso/graphql/args/inscribir-en-curso.args';
import { ActualizarCursoInput } from '@modules/curso/graphql/inputs/actualizar-curso.input';
import type { GraphQLContextWithLoaders } from '@modules/curso/graphql/common/context-with-loader';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver, Context } from '@nestjs/graphql';
import { RequirePermissions, RequireRoles } from '@modules/curso/graphql/decorators/auth.decorators';
import { GenericResponseMessage } from '@modules/curso/graphql/types/generic/response-message.model';
import type { SecureGraphQLContext } from '@modules/curso/graphql/interfaces/secure-context.interface';

@Resolver(() => Curso)
export class CursoResolver {
    constructor(
        private readonly cursoService: CursoService,
        private readonly estadisticasService: EstadisticasService
    ) { }

    @Query(() => Curso, { name: 'curso' })
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.ESTUDIANTE, RolUsuario.INSTRUCTOR, RolUsuario.ADMINISTRADOR)
    async curso(
        @Args('id', { type: () => ID })
        id: string,
        @Context() context: SecureGraphQLContext,
    ): Promise<Curso> {
        const usuario = context.requireAuth();
        const tieneAcceso = await this.cursoService.verificarAccesoUsuario(usuario.id, id);

        if (!tieneAcceso && !usuario.roles.includes(RolUsuario.ADMINISTRADOR)) {
            throw new Error('No tienes acceso a este curso');
        }

        return this.cursoService.obtenerCompleto(id);
    }

    @Query(() => [Curso], { name: 'cursos' })
    async cursos(): Promise<Curso[]> {
        return this.cursoService.obtenerTodosLosCursos();
    }

    @Mutation(() => Curso, { name: 'crearCurso' })
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.ADMINISTRADOR, RolUsuario.INSTRUCTOR)
    @RequirePermissions('curso:crear')
    async crearCurso(
        @Args('datos') datos: CrearCursoInput,
        @Context() context: SecureGraphQLContext
    ): Promise<Curso> {
        const usuario = context.requireAuth();

        // El instructor solo puede crear cursos para sí mismo
        if (usuario.roles.includes(RolUsuario.INSTRUCTOR) && !usuario.roles.includes(RolUsuario.ADMINISTRADOR)) {
            datos.instructorId = usuario.id;
        }

        return this.cursoService.crear(datos);
    }


    @Mutation(() => Curso)
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.INSTRUCTOR, RolUsuario.ADMINISTRADOR)
    @RequirePermissions('curso:editar')
    async actualizarCurso(
        @Args('id', { type: () => ID }) id: string,
        @Args('datos') datos: ActualizarCursoInput,
        @Context() context: SecureGraphQLContext
    ): Promise<Curso> {
        const usuario = context.requireAuth();

        const curso = await this.cursoService.obtenerCompleto(id);

        if (curso.instructor.id !== usuario.id && !usuario.roles.includes(RolUsuario.ADMINISTRADOR)) {
            throw new ForbiddenException('Solo el instructor puede editar este curso');
        }

        return this.cursoService.actualizar(id, datos);
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

    @Query(() => [Curso])
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.ESTUDIANTE, RolUsuario.INSTRUCTOR, RolUsuario.ADMINISTRADOR)
    async cursosDisponibles(@Context() context: SecureGraphQLContext): Promise<Curso[]> {
        const usuario = context.requireAuth();
        return this.cursoService.obtenerDisponiblesParaUsuario(usuario.id);
    }

    @Mutation(() => GenericResponseMessage, { name: 'inscribirEnCurso' })
    async inscribirEnCurso(
        @Args() { cursoId, estudianteId }: InscribirEnCursoArgs
    ): Promise<GenericResponseMessage> {
        return this.cursoService.inscribir(cursoId, estudianteId);
    }
}
