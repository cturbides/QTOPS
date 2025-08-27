import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { Curso } from '@modules/curso/graphql/types/curso.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { CursoService } from '@modules/curso/services/curso.service';
import { UsuarioService } from '@modules/curso/services/usuario.service';
import { LeccionService } from '@modules/curso/services/leccion.service';
import { ProgresoService } from '@modules/curso/services/progreso.service';
import { Leccion as LeccionEntity } from '@modules/curso/entities/leccion.entity';
import { createInstrumentedDataLoader } from './config/instrumented-data-loader.config';
import { ProgresoEstudiante } from '@modules/curso/entities/progreso-estudiante.entity';

// Sistema completo de DataLoaders para e-learning
@Injectable()
export class ELearningDataLoaderSystem {
    constructor(
        private readonly cursoService: CursoService,
        private readonly usuarioService: UsuarioService,
        private readonly leccionService: LeccionService,
        private readonly progresoService: ProgresoService
    ) { }

    // Loader para usuarios con cache inteligente
    readonly usuarioLoader = createInstrumentedDataLoader<string, Usuario | null>(
        async (userIds: readonly string[]) => {
            const usuarios = await this.usuarioService.obtenerPorIds([...userIds]);
            return userIds.map(id => usuarios.find(u => u.id === id) || null);
        },
        'UsuarioLoader'
    );

    // Loader para lecciones por curso con ordenamiento
    readonly leccionesPorCursoLoader = createInstrumentedDataLoader<string, Leccion[]>(
        async (cursoIds: readonly string[]) => {
            const lecciones = await this.leccionService
                .obtenerPorCursosConOrden([...cursoIds]);

            return cursoIds.map(cursoId =>
                lecciones
                    .filter(l => (l as LeccionEntity).cursoId === cursoId)
                    .sort((a, b) => a.orden - b.orden)
            );
        },
        'LeccionesPorCursoLoader'
    );

    // Loader para progreso de estudiantes con cálculos
    readonly progresoEstudianteLoader = new DataLoader<
        { estudianteId: string; cursoId: string },
        ProgresoEstudiante
    >(
        async (keys) => {
            const progreso = await this.progresoService.obtenerDetallado(
                keys.map(k => ({ estudianteId: k.estudianteId, cursoId: k.cursoId }))
            );

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
            // Función de cache key personalizada para objetos complejos
            cacheKeyFn: (key) => key
        }
    );

    // Loader con lógica de negocio compleja
    readonly recomendacionesLoader = createInstrumentedDataLoader<string, Curso[]>(
        async (userIds: readonly string[]) => {
            // Obtener historial de usuarios en batch
            const historiales = await this.usuarioService
                .obtenerHistorialPorUsuarios([...userIds]);

            // Calcular recomendaciones usando ML/algoritmos
            const recomendaciones = await Promise.all(
                userIds.map(async userId => {
                    const historial = historiales.filter(h => h.userId === userId);
                    return this.cursoService.calcularRecomendaciones(historial);
                })
            );

            return recomendaciones;
        },
        'RecomendacionesLoader'
    );

    // Loader para estadísticas complejas de cursos
    readonly estadisticasCursoLoader = createInstrumentedDataLoader<string, any>(
        async (cursoIds: readonly string[]) => {
            console.log(`[DataLoader] Calculando estadísticas para ${cursoIds.length} cursos`);

            // Obtener todos los datos necesarios en paralelo
            const [cursos, progresosPorCurso] = await Promise.all([
                Promise.all(cursoIds.map(id => this.cursoService.obtenerRecord(id))),
                Promise.all(cursoIds.map(id => this.progresoService.obtenerPorCurso(id)))
            ]);

            return cursoIds.map((cursoId, index) => {
                const curso = cursos[index];
                const progresos = progresosPorCurso[index];

                const totalEstudiantes = curso.estudianteIds.length;
                const estudiantesActivos = progresos.filter(p => p.porcentajeCompletado > 0).length;
                const promedioProgreso = progresos.length > 0
                    ? progresos.reduce((sum, p) => sum + p.porcentajeCompletado, 0) / progresos.length
                    : 0;

                const calificacionPromedio = curso.ratings.length > 0
                    ? curso.ratings.reduce((sum, rating) => sum + rating, 0) / curso.ratings.length
                    : 0;

                return {
                    totalEstudiantes,
                    estudiantesActivos,
                    promedioProgreso: Math.round(promedioProgreso),
                    calificacionPromedio: Math.round(calificacionPromedio * 100) / 100,
                    totalLecciones: 0, // Se calculará con el leccionLoader
                    engagementScore: this.calcularEngagement(progresos, totalEstudiantes)
                };
            });
        },
        'EstadisticasCursoLoader'
    );

    private calcularEngagement(progresos: ProgresoEstudiante[], totalEstudiantes: number): number {
        if (totalEstudiantes === 0) return 0;

        const estudiantesActivos = progresos.filter(p => p.porcentajeCompletado > 0).length;
        const estudiantesCompletados = progresos.filter(p => p.porcentajeCompletado === 100).length;

        // Fórmula de engagement: (activos * 0.5 + completados * 1) / total
        const engagement = ((estudiantesActivos * 0.5) + (estudiantesCompletados * 1)) / totalEstudiantes;
        return Math.round(engagement * 100) / 100;
    }

    // Método para limpiar cache cuando sea necesario
    clearCache() {
        this.usuarioLoader.clearAll();
        this.leccionesPorCursoLoader.clearAll();
        this.progresoEstudianteLoader.clearAll();
        this.recomendacionesLoader.clearAll();
        this.estadisticasCursoLoader.clearAll();
        console.log('[DataLoader] Cache limpiado para todos los loaders');
    }
}
