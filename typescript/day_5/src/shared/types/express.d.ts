export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ExpressError extends Error {
    code?: string;
    details?: any;
    statusCode?: number;
}

declare global {
    export namespace Express {
        export interface Request {
            user?: {
                id: string;
                email: string;
                permissions: string[];
            };
            correlationId: string;
            startTime: number;
        }


        export interface Response {
            success<T>(data: T, message?: string): Response;
            error(message: string, code?: number, details?: any): Response;
            paginated<T>(data: T[], pagination: PaginationMeta): Response;
        }
    }
}

