export interface BusinessErrorResponse {
    path: string;
    success: false;
    method: string;
    message: string;
    errorCode: string;
    timestamp: string;
    requestId: string;
    details?: string[];
    statusCode: number;
}