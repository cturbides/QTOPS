import { Injectable } from '@nestjs/common';
import { GraphQLAuthService } from './graphql-auth.service';
import { AuditLoggingService } from './audit-logging.service';
import { GraphQLSecurityService } from './graphql-security.service';
import { GraphQLRateLimitService } from './graphql-rate-limit.service';
import { AuditSeverity } from '@modules/curso/entities/audit/audit-severity.enum';
import { AuditEventType } from '@modules/curso/entities/audit/audit-event-type.enum';

@Injectable()
export class GraphQLSecurityMiddleware {
  constructor(
    private readonly authService: GraphQLAuthService,
    private readonly auditService: AuditLoggingService,
    private readonly securityService: GraphQLSecurityService,
    private readonly rateLimitService: GraphQLRateLimitService,
  ) { }

  createSecurityPlugin() {
    return {
      requestDidStart: () => ({
        willSendResponse: this.willSendResponse.bind(this),
        didResolveOperation: this.didResolveOperation.bind(this),
        didEncounterErrors: this.didEncounterErrors.bind(this),
      })
    };
  }

  private async didResolveOperation({ request, document, operationName, context }: any) {
    try {
      const queryString = document.loc?.source.body || '';
      const complejidad = this.securityService.calculateQueryComplexity(document);
      const profundidad = this.securityService.calculateQueryDepth(document);
      const ip = this.extractIP(request);
      const userAgent = request.headers?.['user-agent'];

      // Validar límites de seguridad
      await this.securityService.validateQueryLimits(complejidad, profundidad);

      // Verificar rate limits
      const rateLimitInfo = await this.rateLimitService.verificarLimites(context?.usuario, complejidad, ip);
      
      if (context) {
        context.rateLimitInfo = rateLimitInfo;
      }

      // Determinar tipo de operación
      const operationType = this.getOperationType(queryString);
      
      // Log de acceso a datos para todas las operaciones
      await this.auditService.logDataAccess({
        usuario: context?.usuario,
        ip,
        operationName: operationName || 'Unknown',
        operationType,
        resourceType: this.extractResourceType(queryString),
        queryComplexity: complejidad,
        queryDepth: profundidad,
        success: true
      });

      // Log específico para operaciones sensibles
      if (this.isSensitiveOperation(operationName, operationType)) {
        await this.auditService.logOperation({
          eventType: operationType === 'mutation' ? AuditEventType.DATA_MODIFICATION : AuditEventType.DATA_ACCESS,
          severity: operationType === 'mutation' ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
          operationName: operationName || 'Unknown',
          operationType,
          query: queryString,
          usuario: context?.usuario,
          ip,
          userAgent,
          success: true,
          resourceType: this.extractResourceType(queryString),
          queryComplexity: complejidad,
          queryDepth: profundidad,
          metadata: {
            isSensitiveOperation: true,
            rateLimitInfo: {
              remaining: rateLimitInfo.peticionesRestantes,
              complexity: rateLimitInfo.complejidadRestante
            }
          }
        });
      }

    } catch (error) {
      const ip = this.extractIP(request);
      
      await this.auditService.logSecurityViolation({
        usuario: context?.usuario,
        ip,
        operationName: operationName || 'Unknown',
        violationType: error.message || 'Unknown security violation',
        details: {
          errorCode: error.extensions?.code,
          complexity: error.extensions?.complexity,
          depth: error.extensions?.depth
        },
        queryComplexity: error.extensions?.complexity,
        queryDepth: error.extensions?.depth
      });

      throw error; 
    }
  }

  private async didEncounterErrors({ errors, request, context }: any) {
    const ip = this.extractIP(request);
    const userAgent = request.headers?.['user-agent'];

    for (const error of errors) {
      if (this.isAuthError(error)) {
        await this.auditService.logAuthentication({
          usuario: context?.usuario,
          ip,
          userAgent,
          success: false,
          errorMessage: error.message,
          metadata: {
            errorCode: error.extensions?.code,
            stackTrace: error.stack
          }
        });
      }
      
      else if (this.isSecurityError(error)) {
        await this.auditService.logSecurityViolation({
          usuario: context?.usuario,
          ip,
          violationType: error.extensions?.code || 'SECURITY_ERROR',
          details: {
            message: error.message,
            code: error.extensions?.code,
            path: error.path
          }
        });
      }
    }
  }

  private async willSendResponse({ response, context, request }: any) {
    const rateLimitInfo = context?.rateLimitInfo;

    if (rateLimitInfo && response.http) {
      response.http.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
      response.http.headers.set('X-RateLimit-Remaining', rateLimitInfo.peticionesRestantes.toString());
    }

    if (response.data && this.isCriticalOperation(context?.operationName)) {
      const ip = this.extractIP(request);
      
      await this.auditService.logOperation({
        eventType: AuditEventType.DATA_ACCESS,
        severity: AuditSeverity.MEDIUM,
        operationName: context?.operationName,
        usuario: context?.usuario,
        ip,
        success: true,
        metadata: {
          responseSize: JSON.stringify(response.data).length,
          hasData: !!response.data,
          operationType: 'critical_operation'
        }
      });
    }
  }

  private extractIP(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           req.headers?.['x-forwarded-for']?.split(',')[0] ||
           (req.connection?.socket ? req.connection.socket.remoteAddress : '127.0.0.1');
  }

  private getOperationType(query: string): 'query' | 'mutation' | 'subscription' {
    if (query.trim().startsWith('mutation')) return 'mutation';
    if (query.trim().startsWith('subscription')) return 'subscription';
    return 'query';
  }

  private extractResourceType(query: string): string {
    // Extraer el tipo de recurso principal de la query
    const matches = query.match(/(?:query|mutation|subscription)\s*\{?\s*(\w+)/);
    return matches?.[1] || 'unknown';
  }

  private isSensitiveOperation(operationName?: string, operationType?: string): boolean {
    if (!operationName) return false;
    
    const sensitiveOps = [
      'crearCurso', 'actualizarCurso', 'eliminarCurso',
      'crearUsuario', 'actualizarUsuario', 'eliminarUsuario',
      'cursosDisponibles', 'estadisticasSistema',
      'inscribirEnCurso', 'cambiarRolUsuario'
    ];
    
    return operationType === 'mutation' || sensitiveOps.includes(operationName);
  }

  private isCriticalOperation(operationName?: string): boolean {
    if (!operationName) return false;
    
    const criticalOps = [
      'eliminarCurso', 'eliminarUsuario', 'cambiarRolUsuario',
      'exportarDatos', 'importarDatos', 'resetearSistema'
    ];
    
    return criticalOps.includes(operationName);
  }

  private isAuthError(error: any): boolean {
    const authCodes = ['UNAUTHENTICATED', 'UNAUTHORIZED', 'FORBIDDEN', 'TOKEN_INVALID'];
    return authCodes.includes(error.extensions?.code);
  }

  private isSecurityError(error: any): boolean {
    const securityCodes = [
      'RATE_LIMIT_EXCEEDED', 'QUERY_TOO_COMPLEX', 'QUERY_TOO_DEEP',
      'SECURITY_VIOLATION', 'INTROSPECTION_DISABLED'
    ];
    return securityCodes.includes(error.extensions?.code);
  }
}
