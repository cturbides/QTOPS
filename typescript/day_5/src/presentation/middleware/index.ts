import { PaginationMeta } from '@shared/types/express';
import { Request, Response, NextFunction } from 'express';

export namespace Middleware {
    export function correlationId(req: Request, res: Response, next: NextFunction): void {
        req.correlationId = req.headers['x-correlation-id'] as string ||
            `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.setHeader('X-Correlation-ID', req.correlationId);
        next();
    }

    export function requestTiming(req: Request, res: Response, next: NextFunction): void {
        req.startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - req.startTime;
            console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        });

        next();
    }

    export function responseHelpers(req: Request, res: Response, next: NextFunction): void {
        res.success = function <T>(data: T, message = 'Success') {
            return this.json({
                success: true,
                message,
                data,
                correlationId: req.correlationId
            });
        };

        res.error = function (message: string, code = 500, details?: any) {
            return this.status(code).json({
                success: false,
                message,
                details,
                correlationId: req.correlationId
            });
        };

        res.paginated = function <T>(data: T[], pagination: PaginationMeta) {
            return this.json({
                success: true,
                data,
                pagination,
                correlationId: req.correlationId
            });
        };

        next();
    }
}