export interface IPerformanceContext {
    query: string;
    depth?: number;
    userId?: string;
    startTime: number;
    complexity?: number;
    operationName?: string;
    variables?: Record<string, any>;
}