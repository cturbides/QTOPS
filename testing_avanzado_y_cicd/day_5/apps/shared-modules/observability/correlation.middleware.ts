import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Generate or extract correlation ID
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    
    // Add to request object
    req['correlationId'] = correlationId;
    
    // Add to response headers
    res.setHeader('x-correlation-id', correlationId);
    
    // Add service identifier
    res.setHeader('x-service-name', process.env.SERVICE_NAME || 'unknown');
    res.setHeader('x-service-version', process.env.SERVICE_VERSION || '1.0.0');
    
    next();
  }
}
