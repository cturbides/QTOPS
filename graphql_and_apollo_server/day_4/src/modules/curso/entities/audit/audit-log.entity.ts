import { AuditSeverity } from "./audit-severity.enum";
import { AuditEventType } from "./audit-event-type.enum";

export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    severity: AuditSeverity;
    eventType: AuditEventType;

    // Usuario y sesión
    userId?: string;
    userEmail?: string;
    sessionId?: string;
    userRoles?: string[];

    // Request info
    ip: string;
    userAgent?: string;

    // GraphQL específico
    query?: string;
    variables?: any;
    operationName?: string;
    operationType?: 'query' | 'mutation' | 'subscription';

    // Resultados
    success: boolean;
    errorCode?: string;
    errorMessage?: string;

    // Datos específicos
    changes?: any;
    resourceId?: string;
    resourceType?: string;

    // Métricas de seguridad
    queryDepth?: number;
    queryComplexity?: number;

    // Metadata adicional
    metadata?: Record<string, any>;
}
