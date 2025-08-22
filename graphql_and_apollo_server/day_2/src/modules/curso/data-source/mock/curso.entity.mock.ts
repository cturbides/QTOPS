import { Curso } from "@modules/curso/entities/curso.entitiy";
import { generateId } from "@modules/curso/data-source/utils/generate-id.util";
import { mockUsuarios } from "@modules/curso/data-source/mock/usuario.entity.mock";

export const mockCursos: Curso[] = [
    {
        id: generateId(),
        ratings: [5, 4, 4, 5, 5],
        etiquetas: ['graphql', 'api'],
        instructorId: mockUsuarios[0].id,
        titulo: 'Introducción a GraphQL',
        estudianteIds: [mockUsuarios[1].id],
        descripcion: 'Aprende GraphQL desde cero',
    },
    {
        id: generateId(),
        ratings: [5, 5, 5, 4, 5],
        titulo: 'Introducción a React',
        etiquetas: ['react', 'frontend'],
        instructorId: mockUsuarios[1].id,
        estudianteIds: [mockUsuarios[0].id],
        descripcion: 'Aprende React desde cero',
    }
];
