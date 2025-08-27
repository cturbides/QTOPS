import { dataSource } from "@modules/curso/data-source/index";
import { Usuario } from "@modules/curso/entities/usuario.entity";
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validarAccesoCurso(usuarioId: string, cursoId: string): Promise<void> {
    if (!usuarioId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const cursosUsuario = dataSource.usuariosConCursos.get(usuarioId);

    if (!cursosUsuario || !cursosUsuario.includes(cursoId)) {
      throw new ForbiddenException('Sin acceso al curso');
    }
  }

  tieneAccesoCurso(usuarioId: string, cursoId: string): boolean {
    const cursosUsuario = dataSource.usuariosConCursos.get(usuarioId);

    return Boolean(cursosUsuario && cursosUsuario.includes(cursoId));
  }

  async obtenerUsuarioDesdeToken(token: string): Promise<Pick<Usuario, "id" | "email"> | null> {
    const usuario = dataSource.usuariosPorJWT[token];

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      email: usuario.email || ''
    };
  }
}
