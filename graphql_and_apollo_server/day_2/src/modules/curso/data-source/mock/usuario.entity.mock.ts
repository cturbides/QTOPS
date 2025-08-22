import { Usuario } from "@modules/curso/entities/usuario.entity";
import { generateId } from "@modules/curso/data-source/utils/generate-id.util";

export const mockUsuarios: Usuario[] = [
    { id: generateId(), nombreCompleto: 'Ada Lovelace' },
    { id: generateId(), nombreCompleto: 'Grace Hopper' },
    { id: generateId(), nombreCompleto: 'Alan Turing' },
    { id: generateId(), nombreCompleto: 'Margaret Hamilton' },
    { id: generateId(), nombreCompleto: 'John von Neumann' },
];
