import { Leccion } from "@modules/curso/entities/leccion.entity";
import { mockCursos } from "@modules/curso/data-source/mock/curso.entity.mock";
import { generateId } from "@modules/curso/data-source/utils/generate-id.util";

export const mockLecciones: Leccion[] = [
    { id: generateId(), cursoId: mockCursos[0].id, titulo: '¿Qué es GraphQL?', orden: 1 },
    { id: generateId(), cursoId: mockCursos[0].id, titulo: 'Schemas y tipos', orden: 2 },
    { id: generateId(), cursoId: mockCursos[0].id, titulo: 'Resolvers y contexto', orden: 3 }
];
