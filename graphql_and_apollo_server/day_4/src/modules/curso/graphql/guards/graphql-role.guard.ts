import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SecureGraphQLContext } from '@modules/curso/graphql/interfaces/secure-context.interface';
import { USER_PERMISSIONS_METADATA, USER_ROLES_METADATA } from '@modules/curso/graphql/common/secure-metadata.constants';

@Injectable()
export class GraphQLRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);

    const { usuario } = gqlContext.getContext() as SecureGraphQLContext;

    if (!usuario) {
      return false; // No autenticado
    }

    const requiredRoles = this.reflector.get<RolUsuario[]>(USER_ROLES_METADATA, context.getHandler());

    if (requiredRoles && !this.hasRequiredRoles(usuario.roles, requiredRoles)) {
      return false;
    }

    const requiredPermissions = this.reflector.get<string[]>(USER_PERMISSIONS_METADATA, context.getHandler());

    if (requiredPermissions && !this.hasRequiredPermissions(usuario.permisos, requiredPermissions)) {
      return false;
    }

    return true;
  }

  private hasRequiredRoles(userRoles: string[], requiredRoles: RolUsuario[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  private hasRequiredPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}
