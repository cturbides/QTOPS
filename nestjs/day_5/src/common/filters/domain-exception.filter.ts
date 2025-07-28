import { Response, Request } from 'express';
import { DomainException } from '@common/exceptions/domain.exceptions';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { BusinessErrorResponse } from '@common/interfaces/business-error-response.interface';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(DomainExceptionFilter.name);

    catch(exception: DomainException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const errorResponse: BusinessErrorResponse = {
            success: false,
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: exception.message,
            errorCode: exception.constructor.name,
            details: (exception.getResponse() as any)?.details,
            requestId: request.headers['x-request-id'] as string || 'unknown',
        };

        if (exception.getStatus() >= 500) {
            this.logger.error(`Domain Error: ${exception.message}`, exception.stack);
        } else {
            this.logger.warn(`Business Rule Violation: ${exception.message}`);
        }

        response.status(exception.getStatus()).json(errorResponse);
    }
}
