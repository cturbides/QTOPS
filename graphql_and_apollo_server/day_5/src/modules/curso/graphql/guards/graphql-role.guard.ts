import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuditLoggingService } from '@modules/curso/services/security/audit-logging.service';
import { SecureGraphQLContext } from '@modules/curso/graphql/interfaces/secure-context.interface';
import { USER_PERMISSIONS_METADATA, USER_ROLES_METADATA } from '@modules/curso/graphql/common/secure-metadata.constants';

@Injectable()
export class GraphQLRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private auditService: AuditLoggingService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { usuario, req } = gqlContext.getContext() as SecureGraphQLContext;
    const info = gqlContext.getInfo();

    const requiredRoles = this.reflector.get<RolUsuario[]>(USER_ROLES_METADATA, context.getHandler());
    const requiredPermissions = this.reflector.get<string[]>(USER_PERMISSIONS_METADATA, context.getHandler());

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    if (!usuario) {
      await this.auditService.logAuthorization({
        usuario: null,
        ip: this.extractIP(req),
        operationName: info.fieldName,
        resourceType: info.parentType.name,
        success: false,
        requiredRoles: requiredRoles || [],
        requiredPermissions: requiredPermissions || [],
        errorMessage: 'Usuario no autenticado'
      });
      return false;
    }

    if (requiredRoles && !this.hasRequiredRoles(usuario.roles, requiredRoles)) {
      await this.auditService.logAuthorization({
        usuario,
        ip: this.extractIP(req),
        operationName: info.fieldName,
        resourceType: info.parentType.name,
        success: false,
        requiredRoles: requiredRoles || [],
        requiredPermissions: requiredPermissions || [],
        errorMessage: `Roles insuficientes. Requeridos: ${requiredRoles.join(', ')}. Usuario tiene: ${usuario.roles.join(', ')}`
      });
      return false;
    }

    if (requiredPermissions && !this.hasRequiredPermissions(usuario.permisos, requiredPermissions)) {
      await this.auditService.logAuthorization({
        usuario,
        ip: this.extractIP(req),
        operationName: info.fieldName,
        resourceType: info.parentType.name,
        success: false,
        requiredRoles: requiredRoles || [],
        requiredPermissions: requiredPermissions || [],
        errorMessage: `Permisos insuficientes. Requeridos: ${requiredPermissions.join(', ')}`
      });
      return false;
    }

    if (this.isSensitiveOperation(info.fieldName, requiredRoles, requiredPermissions)) {
      await this.auditService.logAuthorization({
        usuario,
        ip: this.extractIP(req),
        operationName: info.fieldName,
        resourceType: info.parentType.name,
        success: true,
        requiredRoles: requiredRoles || [],
        requiredPermissions: requiredPermissions || []
      });
    }

    return true;
  }

  private hasRequiredRoles(userRoles: string[], requiredRoles: RolUsuario[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  private hasRequiredPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  private extractIP(req: any): string {
    return req?.ip || 
           req?.connection?.remoteAddress || 
           req?.socket?.remoteAddress ||
           req?.headers?.['x-forwarded-for']?.split(',')[0] ||
           '127.0.0.1';
  }

  private isSensitiveOperation(operationName: string, requiredRoles?: RolUsuario[], requiredPermissions?: string[]): boolean {
    const sensitiveRoles = [RolUsuario.INSTRUCTOR, RolUsuario.ADMINISTRADOR];
    const hasSensitiveRoles = requiredRoles?.some(role => sensitiveRoles.includes(role));
    
    const modificationPermissions = ['crear', 'editar', 'eliminar', 'administrar'];
    const hasModificationPermissions = requiredPermissions?.some(perm => 
      modificationPermissions.some(mod => perm.includes(mod))
    );

    return hasSensitiveRoles || hasModificationPermissions || false;
  }
}
