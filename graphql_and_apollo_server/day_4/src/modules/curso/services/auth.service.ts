import { dataSource } from "@modules/curso/data-source/index";
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

  async obtenerUsuarioDesdeToken(token: string): Promise<{ id: string; email: string } | null> {
    return dataSource.usuariosPorJWT[token] ?? null;
  }
}
