import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { ProgresoInput } from '@modules/curso/graphql/inputs/progreso.input';
import { GetProgresoArgs } from '@modules/curso/graphql/args/get-progreso.args';
import { ProgresoEstudiante } from '@modules/curso/graphql/types/progreso-estudiante.model';
import type { GraphQLContextWithLoaders } from '@modules/curso/graphql/common/context-with-loader'; 

@Resolver()
export class ProgresoResolver {
    @Query(() => ProgresoEstudiante, {
        name: 'progresoPorCurso',
    })
    async obtenerProgresoPorCurso(
        @Args() { estudianteId, cursoId }: GetProgresoArgs,
        @Context() context: GraphQLContextWithLoaders
    ): Promise<ProgresoEstudiante> {
        return context.loaders.progreso.load({ estudianteId, cursoId });
    }

    @Query(() => [ProgresoEstudiante], {
        name: 'progresoMultiple',
        description: 'Obtiene el progreso de múltiples estudiantes'
    })
    async obtenerProgresoMultiple(
        @Args('consultas', { type: () => [ProgresoInput] }) consultas: ProgresoInput[],
        @Context() context: GraphQLContextWithLoaders
    ): Promise<ProgresoEstudiante[]> {
        const results = await context.loaders.progreso.loadMany(consultas);

        return results.filter((result): result is ProgresoEstudiante => !(result instanceof Error));
    }
}
