import DataLoader from 'dataloader';
import { GraphQLContextWithLoaders } from './context-with-loader';
import { ServiceContainer } from '@modules/curso/graphql/interfaces/service.container';
import { createInstrumentedDataLoader } from '@modules/curso/dataloaders/config/instrumented-data-loader.config';

export function createGraphQLContext(req: any, services: ServiceContainer): GraphQLContextWithLoaders {
    return {
        req,
        loaders: {
            // Usuario DataLoader
            usuario: createInstrumentedDataLoader(
                async (userIds: readonly string[]) => {
                    const usuarios = await services.usuarioService.obtenerPorIds([...userIds]);
                    return userIds.map(id => usuarios.find(u => u.id === id) || null);
                },
                'ContextUsuarioLoader'
            ),

            // Curso DataLoader
            curso: createInstrumentedDataLoader(
                async (cursoIds: readonly string[]) => {
                    const cursos = await Promise.all(
                        cursoIds.map(id => services.cursoService.obtenerCompleto(id).catch(() => null))
                    );
                    return cursos;
                },
                'ContextCursoLoader'
            ),

            // Leccion DataLoader (por curso)
            leccion: createInstrumentedDataLoader(
                async (cursoIds: readonly string[]) => {
                    const lecciones = await services.leccionService.obtenerPorCursosConOrden([...cursoIds]);

                    return cursoIds.map(cursoId =>
                        lecciones
                            .filter(l => (l as any).cursoId === cursoId)
                            .sort((a, b) => a.orden - b.orden)
                    );
                },
                'ContextLeccionLoader'
            ),

            // Progreso DataLoader
            progreso: new DataLoader(
                async (keys: readonly { estudianteId: string; cursoId: string }[]) => {
                    const progreso = await services.progresoService.obtenerDetallado([...keys]);

                    return keys.map(key => {
                        const p = progreso.find(pr =>
                            pr.estudianteId === key.estudianteId && pr.cursoId === key.cursoId
                        );
                        return p || {
                            estudianteId: key.estudianteId,
                            cursoId: key.cursoId,
                            porcentajeCompletado: 0,
                            leccionesVistas: []
                        };
                    });
                },
                {
                    cacheKeyFn: (key) => key
                }
            )
        }
    };
}