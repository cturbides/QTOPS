import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source/index';
import { Curso } from '@modules/curso/graphql/types/curso.model';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Curso as CursoEntity } from "@modules/curso/entities/curso.entitiy";
import { Leccion as LeccionEntity } from '@modules/curso/entities/leccion.entity';
import { CrearCursoInput } from '@modules/curso/graphql/inputs/crear-curso.input';

@Injectable()
export class CursoService {
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

    async inscribir(cursoId: string, estudianteId: string) {
        const curso = await this.obtenerRecord(cursoId);
        await this.obtenerEstudiante(estudianteId);

        if (!curso.estudianteIds.includes(estudianteId)) {
            curso.estudianteIds.push(estudianteId);
        }
    }
}
