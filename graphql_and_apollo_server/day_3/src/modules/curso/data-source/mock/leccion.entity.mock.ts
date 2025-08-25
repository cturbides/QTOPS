import { Leccion } from "@modules/curso/entities/leccion.entity";
import { mockCursos } from "@modules/curso/data-source/mock/curso.entity.mock";
import { generateId } from "@modules/curso/data-source/utils/generate-id.util";

export const mockLecciones: Leccion[] = [
    { id: generateId(), cursoId: mockCursos[0].id, titulo: '¿Qué es GraphQL?', orden: 1 },
    { id: generateId(), cursoId: mockCursos[0].id, titulo: 'Schemas y tipos', orden: 2 },
    { id: generateId(), cursoId: mockCursos[0].id, titulo: 'Resolvers y contexto', orden: 3, contenido: 'Contenido de la lección 3' },
    { id: generateId(), titulo: 'Mutations', cursoId: mockCursos[0].id, orden: 4, contenido: 'Contenido de la lección 4' },
    { id: generateId(), titulo: 'Introducción a React', cursoId: mockCursos[1].id, orden: 1, contenido: 'Contenido de la lección 1' },
    { id: generateId(), titulo: 'Componentes', cursoId: mockCursos[1].id, orden: 2, contenido: 'Contenido de la lección 2' },
    { id: generateId(), titulo: 'Hooks', cursoId: mockCursos[1].id, orden: 3, contenido: 'Contenido de la lección 3' },
    { id: generateId(), titulo: 'Estado', cursoId: mockCursos[1].id, orden: 4, contenido: 'Contenido de la lección 4' },
];
