import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/services/users.service';
import { CanActivate, ExecutionContext, forwardRef, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('Token requerido');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            if (!payload || !payload.sub) {
                throw new UnauthorizedException('Token inválido');
            }

            const user = await this.usersService.findById(payload.sub);

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Usuario inválido o inactivo');
            }

            request.user = user;
            return true;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }
    }

    private extractToken(request: any): string | undefined {
        return request.headers.authorization?.replace('Bearer ', '');
    }
}
