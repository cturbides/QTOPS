import { Injectable } from '@nestjs/common';
import { dataSource } from "@modules/curso/data-source/index";
import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { Usuario as UsuarioEntity } from "@modules/curso/entities/usuario.entity";
import { HistorialEstudiante } from '@modules/curso/entities/historial-estudiante.entity';

@Injectable()
export class UsuarioService {
    async obtenerPorIds(userIds: string[]): Promise<Usuario[]> {
        console.log(`[UsuarioService] Obteniendo ${userIds.length} usuarios por ID`);

        return dataSource.usuarios.filter((usuario: UsuarioEntity) => userIds.includes(usuario.id));
    }

    async obtenerPorId(id: string): Promise<Usuario> {
        const usuario = dataSource.usuarios.find(u => u.id === id);

        if (!usuario) {
            throw new Error(`Usuario con ID ${id} no encontrado`);
        }

        return usuario;
    }

    async obtenerTodos(): Promise<Usuario[]> {
        return dataSource.usuarios;
    }

    async obtenerHistorialPorUsuarios(userIds: string[]): Promise<HistorialEstudiante[]> {
        return dataSource.historialEstudiante.filter(h => userIds.includes(h.userId));
    }

}
