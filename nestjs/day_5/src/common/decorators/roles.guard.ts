import { Reflector } from '@nestjs/core';
import { Role } from '@common/constants/roles.enum';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        const hasRole = requiredRoles.some(role => user.roles?.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('Permisos insuficientes');
        }

        return true;
    }
}
