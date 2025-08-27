import { Injectable } from '@nestjs/common';
import { dataSource } from "@modules/curso/data-source/index";
import { Leccion } from '@modules/curso/graphql/types/leccion.model';
import { Leccion as LeccionEntity } from "@modules/curso/entities/leccion.entity";

@Injectable()
export class LeccionService {
    async obtenerPorCursosConOrden(cursoIds: string[]): Promise<Leccion[]> {
        console.log(`[LeccionService] Obteniendo lecciones para ${cursoIds.length} cursos`);

        return dataSource.lecciones
            .filter((leccion: LeccionEntity) => cursoIds.includes(leccion.cursoId))
            .sort((a, b) => a.orden - b.orden)
            .map(leccion => ({
                id: leccion.id,
                orden: leccion.orden,
                titulo: leccion.titulo,
                cursoId: leccion.cursoId,
                contenido: leccion.contenido,
            }));
    }

    async obtenerPorIds(leccionIds: string[]): Promise<Leccion[]> {
        console.log(`[LeccionService] Obteniendo ${leccionIds.length} lecciones por ID`);

        return dataSource.lecciones
            .filter((leccion: LeccionEntity) => leccionIds.includes(leccion.id))
            .map((leccion: LeccionEntity) => ({
                id: leccion.id,
                orden: leccion.orden,
                titulo: leccion.titulo,
                contenido: leccion.contenido,
            } as Leccion));
    }

    async obtenerPorCurso(cursoId: string): Promise<Leccion[]> {
        return dataSource.lecciones
            .filter((leccion: LeccionEntity) => cursoId === leccion.cursoId)
            .map(leccion => ({
                id: leccion.id,
                orden: leccion.orden,
                titulo: leccion.titulo,
                cursoId: leccion.cursoId,
                contenido: leccion.contenido,
            }));
    }
}
