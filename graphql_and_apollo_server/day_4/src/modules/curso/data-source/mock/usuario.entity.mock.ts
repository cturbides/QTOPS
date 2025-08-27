import { Usuario } from "@modules/curso/entities/usuario.entity";
import { RolUsuario } from "@modules/curso/entities/auth/rol-usuario.enum";
import { generateId } from "@modules/curso/data-source/utils/generate-id.util";

export const mockUsuarios: Usuario[] = [
    { 
        id: generateId(), 
        nombreCompleto: 'Ada Lovelace',
        email: 'ada@example.com',
        roles: [RolUsuario.ESTUDIANTE],
        activo: true
    },
    { 
        id: generateId(), 
        nombreCompleto: 'Grace Hopper',
        email: 'grace@example.com',
        roles: [RolUsuario.INSTRUCTOR],
        activo: true
    },
    { 
        id: generateId(), 
        nombreCompleto: 'Alan Turing',
        email: 'alan@example.com',
        roles: [RolUsuario.INSTRUCTOR],
        activo: true
    },
    { 
        id: generateId(), 
        nombreCompleto: 'Margaret Hamilton',
        email: 'margaret@example.com',
        roles: [RolUsuario.ADMINISTRADOR],
        activo: true
    },
    { 
        id: generateId(), 
        nombreCompleto: 'John von Neumann',
        email: 'john@example.com',
        roles: [RolUsuario.ESTUDIANTE],
        activo: true
    },
];

export const mockUsuariosPorJWT: Record<string, Usuario> = {
    'token_estudiante': mockUsuarios[0],
    'token_instructor': mockUsuarios[1],
    'token_admin': mockUsuarios[3],
};
