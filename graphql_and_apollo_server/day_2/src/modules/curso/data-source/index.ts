import { mockCursos } from "./mock/curso.entity.mock";
import { generateId } from "./utils/generate-id.util";
import { mockUsuarios } from "./mock/usuario.entity.mock";
import { mockLecciones } from "./mock/leccion.entity.mock";

// Dummy data source
export const dataSource = {
    cursos: mockCursos,
    generateId: generateId,
    usuarios: mockUsuarios,
    lecciones: mockLecciones,
}