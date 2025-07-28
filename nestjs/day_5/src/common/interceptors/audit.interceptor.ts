import { Observable, tap, catchError } from 'rxjs';
import { AuditService } from '@common/services/audit.service';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const action = `${request.method} ${request.route?.path || request.url}`;

        return next.handle().pipe(
            tap(async (result) => {
                await this.auditService.logAction({
                    userId: user?.id,
                    action,
                    resource: this.extractResourceId(request),
                    timestamp: new Date(),
                    success: true,
                    ip: request.ip,
                    userAgent: request.get('User-Agent')
                });
            }),
            catchError(async (error) => {
                await this.auditService.logAction({
                    userId: user?.id,
                    action,
                    resource: this.extractResourceId(request),
                    timestamp: new Date(),
                    success: false,
                    error: error.message,
                    ip: request.ip,
                    userAgent: request.get('User-Agent')
                });
                throw error;
            })
        );
    }

    private extractResourceId(request: any): string | undefined {
        return request.params?.id || request.body?.id;
    }
}