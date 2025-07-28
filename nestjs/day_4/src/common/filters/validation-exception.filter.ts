import { Response, Request } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger, } from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationExceptionFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const responseBody = exception.getResponse() as
            | string
            | { message: string[]; error: string };

        const details =
            typeof responseBody === 'object' && 'message' in responseBody
                ? responseBody.message
                : [];

        this.logger.warn(`Validation failed: ${JSON.stringify(details)}`);

        response.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Error de validación',
            details,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            requestId: request.headers['x-request-id'] as string || 'unknown',
        });
    }
}
