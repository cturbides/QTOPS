import { JwtService } from '@nestjs/jwt';
import { dataSource } from '@modules/curso/data-source';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '@modules/curso/services/usuario.service';
import { generateId } from '@modules/curso/data-source/utils/generate-id.util';
import { UsuarioAutenticado } from '@modules/curso/entities/auth/usuario-autenticado.interface';

@Injectable()
export class GraphQLAuthService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _usuarioService: UsuarioService
  ) { }

  async validarToken(token: string): Promise<UsuarioAutenticado> {
    try {
      const usuario = dataSource.usuariosPorJWT[token];

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      return {
        id: usuario.id,
        sesionId: generateId(),
        email: usuario.email || '',
        roles: usuario.roles || [],
        activo: usuario.activo || false,
        permisos: await this.obtenerPermisos(usuario.roles || []),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private async obtenerPermisos(roles: string[]): Promise<string[]> {
    const permisosPorRol: Record<string, string[]> = {
      'ESTUDIANTE': ['curso:ver', 'progreso:ver'],
      'INSTRUCTOR': ['curso:ver', 'curso:crear', 'curso:editar', 'progreso:ver', 'usuario:ver'],
      'ADMINISTRADOR': ['curso:ver', 'curso:crear', 'curso:editar', 'curso:eliminar', 'progreso:ver', 'usuario:ver', 'usuario:editar', 'sistema:administrar']
    };

    const permisos: string[] = [];

    roles.forEach(rol => {
      if (permisosPorRol[rol]) {
        permisos.push(...permisosPorRol[rol]);
      }
    });

    return [...new Set(permisos)];
  }

  extraerTokenDeRequest(req: any): string | null {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }
}
