import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from 'src/constants/common';
import { Injectable, Inject } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source/index';
import { Curso } from '@modules/curso/graphql/types/curso.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Curso as CursoEntity } from "@modules/curso/entities/curso.entitiy";
import { Leccion as LeccionEntity } from '@modules/curso/entities/leccion.entity';
import { CrearCursoInput } from '@modules/curso/graphql/inputs/crear-curso.input';
import { HistorialEstudiante } from '@modules/curso/entities/historial-estudiante.entity';
import { GenericResponseMessage } from '@modules/curso/graphql/types/generic/response-message.model';
import { ESTUDIANTE_INSCRITO_EN_CURSO_SUB } from '@modules/curso/graphql/common/subscription.constants';
import { InscripcionNotificacion } from '@modules/curso/graphql/types/notifications/inscription-notification.model';

@Injectable()
export class CursoService {
    constructor(
        @Inject(PUB_SUB)
        private readonly pubSub: PubSub
    ) { }

    async crear(datos: CrearCursoInput): Promise<Curso> {
        const instructor = await this.obtenerInstructor(datos.instructorId);

        const newCurso: CursoEntity = {
            titulo: datos.titulo,
            id: dataSource.generateId(),
            instructorId: instructor.id,
            descripcion: datos.descripcion,
            etiquetas: datos.etiquetas ?? [],
            estudianteIds: [],   // arranca vacío
            ratings: []          // sin calificaciones aún
        };

        dataSource.cursos.push(newCurso);

        return {
            lecciones: [], // Bajo demanda
            id: newCurso.id,
            instructor: instructor,
            titulo: newCurso.titulo,
            estadisticas: {} as any, // Campo bajo demanda
            etiquetas: newCurso.etiquetas,
            descripcion: newCurso.descripcion,
        };
    }

    async obtenerCompleto(id: string): Promise<Curso> {
        const curso = dataSource.cursos.find(c => c.id === id);

        if (!curso) {
            throw new Error(`Curso ${id} no encontrado`);
        }

        const instructor: Usuario = await this.obtenerInstructor(curso.instructorId);

        const lecciones: Leccion[] = await this.obtenerLecciones(curso.id);

        return {
            id: curso.id,
            titulo: curso.titulo,
            lecciones: lecciones,
            instructor: instructor,
            descripcion: curso.descripcion,
            etiquetas: curso.etiquetas ?? [],
            estadisticas: {} as any, // Bajo demanda
        };
    }

    async obtenerTodosLosCursos(): Promise<Curso[]> {
        const cursos = dataSource.cursos;

        return Promise.all(cursos.map((curso: CursoEntity) => this.obtenerCompleto(curso.id)));
    }

    async obtenerInstructor(id: string): Promise<Usuario> {
        const instructor = dataSource.usuarios.find(u => u.id === id);

        if (!instructor) {
            throw new Error(`Instructor ${id} no encontrado`);
        }

        return instructor;
    }

    async obtenerLecciones(cursoId: string): Promise<Leccion[]> {
        return dataSource.lecciones.filter(l => l.cursoId === cursoId).sort((a, b) => a.orden - b.orden);
    }

    async obtenerRecord(id: string): Promise<CursoEntity> {
        const curso = dataSource.cursos.find(c => c.id === id);

        if (!curso) {
            throw new Error(`Curso ${id} no encontrado`);
        }

        return curso;

    }

    async agregarLeccion(cursoId: string, titulo: string): Promise<Leccion> {
        const newLeccion: LeccionEntity = {
            titulo: titulo,
            cursoId: cursoId,
            id: dataSource.generateId(),
            orden: dataSource.lecciones.length + 1
        }

        dataSource.lecciones.push(newLeccion);

        return {
            id: newLeccion.id,
            orden: newLeccion.orden,
            titulo: newLeccion.titulo,
            contenido: undefined, // Inicialmente sin contenido
        }
    }

    async obtenerEstudiante(estudianteId: string): Promise<Usuario> {
        const estudiante = dataSource.usuarios.find(u => u.id === estudianteId);

        if (!estudiante) {
            throw new Error(`Estudiante ${estudianteId} no encontrado`);
        }

        return estudiante;
    }

    async calificar(cursoId: string, rating: number): Promise<void> {
        const curso = await this.obtenerRecord(cursoId);

        curso.ratings.push(rating);
    }

    private async sendEstudianteInscritoNotification(cursoId: string, estudianteId: string): Promise<void> {
        console.log(`Enviando notificación de inscripción para estudiante ${estudianteId} en curso ${cursoId}`);

        const payload: InscripcionNotificacion = {
            cursoId: cursoId,
            estudianteId: estudianteId,
            timestamp: new Date().toISOString(),
            mensaje: `Usuario ${estudianteId} inscrito en el curso ${cursoId}`,
        };

        await this.pubSub.publish(ESTUDIANTE_INSCRITO_EN_CURSO_SUB, payload);

        console.log(`Notificación de inscripción enviada para estudiante ${estudianteId} en curso ${cursoId}`);
    }

    async inscribir(cursoId: string, estudianteId: string): Promise<GenericResponseMessage> {
        try {
            const curso = await this.obtenerRecord(cursoId);
            await this.obtenerEstudiante(estudianteId);

            if (!curso.estudianteIds.includes(estudianteId)) {
                curso.estudianteIds.push(estudianteId);
            }

            const cursosUsuario = dataSource.usuariosConCursos.get(estudianteId) || [];

            if (!cursosUsuario.includes(cursoId)) {
                cursosUsuario.push(cursoId);
                dataSource.usuariosConCursos.set(estudianteId, cursosUsuario);
            }

            this.sendEstudianteInscritoNotification(cursoId, estudianteId)
                .catch((err: unknown) => console.error('Error enviando notificación de inscripción:', err));

            return {
                success: true,
                message: `Estudiante ${estudianteId} inscrito en curso ${cursoId} exitosamente.`,
            }
        } catch (error) {
            return {
                success: false,
                message: `Error al inscribir al estudiante ${estudianteId} en el curso ${cursoId}: ${error.message}`,
            }
        }

    }

    // Calculo dummy
    async calcularRecomendaciones(historial: HistorialEstudiante[]): Promise<Curso[]> {
        if (historial.length === 0) {
            return this.obtenerTodosLosCursos().then(cursos => cursos.slice(0, 3));
        }

        // Recomendar cursos similares o avanzados
        const todosCursos = await this.obtenerTodosLosCursos();

        // Filtrar cursos ya tomados
        const cursosYaTomados = historial.map(h => h.cursoId);
        const cursosDisponibles = todosCursos.filter(c => !cursosYaTomados.includes(c.id));

        return cursosDisponibles
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
    }
}
