import { Injectable } from '@nestjs/common';
import { GraphQLAuthService } from './graphql-auth.service';
import { GraphQLSecurityService } from './graphql-security.service';
import { GraphQLRateLimitService } from './graphql-rate-limit.service';

@Injectable()
export class GraphQLSecurityMiddleware {
  constructor(
    private readonly authService: GraphQLAuthService,
    private readonly securityService: GraphQLSecurityService,
    private readonly rateLimitService: GraphQLRateLimitService,
  ) { }

  createSecurityPlugin() {
    return {
      requestDidStart: () => ({
        willSendResponse: this.willSendResponse.bind(this),
        didResolveOperation: this.didResolveOperation.bind(this),
      })
    };
  }

  private didResolveOperation({ request, document, operationName, context }: any) {
    const complejidad = this.securityService.calculateQueryComplexity(document);
    const profundidad = this.securityService.calculateQueryDepth(document);

    this.securityService.validateQueryLimits(complejidad, profundidad);

    const ip = this.extractIP(request);
    const rateLimitInfo = this.rateLimitService.verificarLimites(context?.usuario, complejidad, ip);

    if (context) {
      context.rateLimitInfo = rateLimitInfo;
    }

    this.logSecurityEvent({
      ip,
      complejidad,
      profundidad,
      timestamp: new Date(),
      operacion: operationName,
      usuario: context?.usuario?.id,
    });
  }

  private willSendResponse({ response, context }: any) {
    const rateLimitInfo = context?.rateLimitInfo;

    if (rateLimitInfo && response.http) {
      response.http.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
      response.http.headers.set('X-RateLimit-Remaining', rateLimitInfo.peticionesRestantes.toString());
    }
  }

  private extractIP(req: any): string {
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress ||
      (req.connection?.socket ? req.connection.socket.remoteAddress : '127.0.0.1');
  }

  private logSecurityEvent(event: any): void {
    console.log('[GraphQL Security]', JSON.stringify(event, null, 2));
  }
}
