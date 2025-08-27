import { Injectable } from '@nestjs/common';
import { dataSource } from '@modules/curso/data-source';
import { generateId } from '@modules/curso/data-source/utils/generate-id.util';
import { AuditLogEntry } from '@modules/curso/entities/audit/audit-log.entity';
import { AuditSeverity } from '@modules/curso/entities/audit/audit-severity.enum';
import { AuditEventType } from '@modules/curso/entities/audit/audit-event-type.enum';
import { UsuarioAutenticado } from '@modules/curso/entities/auth/usuario-autenticado.interface';

@Injectable()
export class AuditLoggingService {
  async logOperation(params: {
    eventType: AuditEventType;
    severity: AuditSeverity;
    operationName?: string;
    operationType?: 'query' | 'mutation' | 'subscription';
    query?: string;
    variables?: any;
    usuario?: UsuarioAutenticado | null;
    ip: string;
    userAgent?: string;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    resourceId?: string;
    resourceType?: string;
    changes?: any;
    queryComplexity?: number;
    queryDepth?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    
    const auditEntry: AuditLogEntry = {
      id: generateId(),
      timestamp: new Date(),
      eventType: params.eventType,
      severity: params.severity,
      
      // Usuario
      userId: params.usuario?.id,
      userEmail: params.usuario?.email,
      userRoles: params.usuario?.roles,
      sessionId: params.usuario?.sesionId,
      
      // Request
      ip: params.ip,
      userAgent: params.userAgent,
      
      // GraphQL
      operationName: params.operationName,
      operationType: params.operationType,
      query: params.query,
      variables: params.variables,
      
      // Resultados
      success: params.success,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
      
      // Recursos
      resourceId: params.resourceId,
      resourceType: params.resourceType,
      changes: params.changes,
      
      // Métricas
      queryComplexity: params.queryComplexity,
      queryDepth: params.queryDepth,
      
      // Metadata
      metadata: params.metadata
    };

    // Guardar en dataSource --dummy db-- 
    dataSource.auditLogs.push(auditEntry);

    this.logToConsole(auditEntry);

    if (params.severity === AuditSeverity.CRITICAL) {
      await this.sendCriticalAlert(auditEntry);
    }
  }

  async logAuthentication(params: {
    usuario?: UsuarioAutenticado | null;
    ip: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.AUTHENTICATION,
      severity: params.success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      usuario: params.usuario,
      ip: params.ip,
      userAgent: params.userAgent,
      success: params.success,
      errorMessage: params.errorMessage,
      metadata: params.metadata
    });
  }

  async logAuthorization(params: {
    usuario?: UsuarioAutenticado | null;
    ip: string;
    operationName: string;
    resourceType: string;
    resourceId?: string;
    success: boolean;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    errorMessage?: string;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.AUTHORIZATION,
      severity: params.success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      operationName: params.operationName,
      usuario: params.usuario,
      ip: params.ip,
      success: params.success,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      errorMessage: params.errorMessage,
      metadata: {
        requiredRoles: params.requiredRoles,
        requiredPermissions: params.requiredPermissions
      }
    });
  }

  async logDataAccess(params: {
    usuario?: UsuarioAutenticado | null;
    ip: string;
    operationName: string;
    operationType: 'query' | 'mutation' | 'subscription';
    resourceType: string;
    resourceId?: string;
    queryComplexity?: number;
    queryDepth?: number;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.DATA_ACCESS,
      severity: AuditSeverity.LOW,
      operationName: params.operationName,
      operationType: params.operationType,
      usuario: params.usuario,
      ip: params.ip,
      success: params.success,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      queryComplexity: params.queryComplexity,
      queryDepth: params.queryDepth,
      errorMessage: params.errorMessage
    });
  }

  async logDataModification(params: {
    usuario: UsuarioAutenticado;
    ip: string;
    operationName: string;
    resourceType: string;
    resourceId: string;
    changes: any;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.DATA_MODIFICATION,
      severity: AuditSeverity.MEDIUM,
      operationName: params.operationName,
      operationType: 'mutation',
      usuario: params.usuario,
      ip: params.ip,
      success: params.success,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      changes: params.changes,
      errorMessage: params.errorMessage
    });
  }

  async logSecurityViolation(params: {
    usuario?: UsuarioAutenticado | null;
    ip: string;
    operationName?: string;
    violationType: string;
    details: any;
    queryComplexity?: number;
    queryDepth?: number;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.SECURITY_VIOLATION,
      severity: AuditSeverity.HIGH,
      operationName: params.operationName,
      usuario: params.usuario,
      ip: params.ip,
      success: false,
      errorCode: 'SECURITY_VIOLATION',
      errorMessage: params.violationType,
      queryComplexity: params.queryComplexity,
      queryDepth: params.queryDepth,
      metadata: {
        violationType: params.violationType,
        details: params.details
      }
    });
  }

  async logRateLimit(params: {
    usuario?: UsuarioAutenticado | null;
    ip: string;
    operationName?: string;
    currentRequests: number;
    maxRequests: number;
    currentComplexity: number;
    maxComplexity: number;
  }): Promise<void> {
    await this.logOperation({
      eventType: AuditEventType.RATE_LIMIT,
      severity: AuditSeverity.MEDIUM,
      operationName: params.operationName,
      usuario: params.usuario,
      ip: params.ip,
      success: false,
      errorCode: 'RATE_LIMIT_EXCEEDED',
      metadata: {
        currentRequests: params.currentRequests,
        maxRequests: params.maxRequests,
        currentComplexity: params.currentComplexity,
        maxComplexity: params.maxComplexity
      }
    });
  }

  async getAuditLogs(filters?: {
    userId?: string;
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    ip?: string;
    success?: boolean;
  }): Promise<AuditLogEntry[]> {
    let logs = dataSource.auditLogs;

    if (filters) {
      logs = logs.filter(log => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.eventType && log.eventType !== filters.eventType) return false;
        if (filters.severity && log.severity !== filters.severity) return false;
        if (filters.startDate && log.timestamp < filters.startDate) return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        if (filters.ip && log.ip !== filters.ip) return false;
        if (filters.success !== undefined && log.success !== filters.success) return false;
        return true;
      });
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private logToConsole(entry: AuditLogEntry): void {
    const logLevel = this.getLogLevel(entry.severity);
    const logMessage = {
      level: logLevel,
      timestamp: entry.timestamp.toISOString(),
      auditId: entry.id,
      eventType: entry.eventType,
      severity: entry.severity,
      userId: entry.userId,
      ip: entry.ip,
      operation: entry.operationName,
      success: entry.success,
      error: entry.errorMessage,
      metadata: entry.metadata
    };

    console.log(`[AUDIT-${logLevel.toUpperCase()}]`, JSON.stringify(logMessage, null, 2));
  }

  private getLogLevel(severity: AuditSeverity): string {
    switch (severity) {
      case AuditSeverity.LOW: return 'info';
      case AuditSeverity.MEDIUM: return 'warn';
      case AuditSeverity.HIGH: return 'error';
      case AuditSeverity.CRITICAL: return 'fatal';
      default: return 'info';
    }
  }

  // Dummy
  private async sendCriticalAlert(entry: AuditLogEntry): Promise<void> {
    console.error('🚨 CRITICAL SECURITY ALERT 🚨', {
      auditId: entry.id,
      eventType: entry.eventType,
      userId: entry.userId,
      ip: entry.ip,
      timestamp: entry.timestamp,
      details: entry.metadata
    });
  }
}
