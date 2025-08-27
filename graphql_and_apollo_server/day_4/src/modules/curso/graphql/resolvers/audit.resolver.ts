import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { AuditLog } from '@modules/curso/graphql/types/audit/audit-log.model';
import { RequireRoles } from '@modules/curso/graphql/decorators/auth.decorators';
import { GraphQLRoleGuard } from '@modules/curso/graphql/guards/graphql-role.guard';
import { AuditLogFilter } from '@modules/curso/graphql/inputs/audit/audit-log-filter.input';
import { AuditLoggingService } from '@modules/curso/services/security/audit-logging.service';
import type { SecureGraphQLContext } from '@modules/curso/graphql/interfaces/secure-context.interface';


@Resolver(() => AuditLog)
export class AuditResolver {
    constructor(private readonly auditService: AuditLoggingService) { }

    @Query(() => [AuditLog])
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.ADMINISTRADOR)
    async auditLogs(
        @Args('filter', { nullable: true }) filter?: AuditLogFilter,
        @Context() context?: SecureGraphQLContext
    ): Promise<AuditLog[]> {
        const usuario = context?.requireAuth();

        await this.auditService.logDataAccess({
            usuario,
            ip: context?.req ? this.extractIP(context.req) : '127.0.0.1',
            operationName: 'auditLogs',
            operationType: 'query',
            resourceType: 'AuditLog',
            success: true
        });

        const logs = await this.auditService.getAuditLogs(filter || {});

        return logs.map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            eventType: log.eventType,
            severity: log.severity,
            userId: log.userId,
            userEmail: log.userEmail,
            userRoles: log.userRoles,
            ip: log.ip,
            operationName: log.operationName,
            operationType: log.operationType,
            success: log.success,
            errorMessage: log.errorMessage,
            resourceType: log.resourceType,
            resourceId: log.resourceId
        }));
    }

    @Query(() => [AuditLog])
    @UseGuards(GraphQLRoleGuard)
    @RequireRoles(RolUsuario.ADMINISTRADOR)
    async auditLogsRecientes(
        @Context() context?: SecureGraphQLContext
    ): Promise<AuditLog[]> {
        const usuario = context?.requireAuth();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Últimas 24 horas

        await this.auditService.logDataAccess({
            usuario,
            ip: context?.req ? this.extractIP(context.req) : '127.0.0.1',
            operationName: 'auditLogsRecientes',
            operationType: 'query',
            resourceType: 'AuditLog',
            success: true
        });

        const logs = await this.auditService.getAuditLogs({ startDate, endDate });

        return logs.slice(0, 100).map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            eventType: log.eventType,
            severity: log.severity,
            userId: log.userId,
            userEmail: log.userEmail,
            userRoles: log.userRoles,
            ip: log.ip,
            operationName: log.operationName,
            operationType: log.operationType,
            success: log.success,
            errorMessage: log.errorMessage,
            resourceType: log.resourceType,
            resourceId: log.resourceId
        }));
    }

    private extractIP(req: any): string {
        return req?.ip ||
            req?.connection?.remoteAddress ||
            req?.socket?.remoteAddress ||
            req?.headers?.['x-forwarded-for']?.split(',')[0] ||
            '127.0.0.1';
    }
}
