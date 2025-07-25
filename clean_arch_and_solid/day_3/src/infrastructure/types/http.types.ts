export interface HttpRequest {
    params: { id: string };
    body?: any;
}

export interface HttpResponse {
    body: any;
    statusCode: number;
}
