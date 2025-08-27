import { IPerformanceThresholds } from "@modules/performance/interfaces/performance-threshold.interface";

export const DefaultThresholds: IPerformanceThresholds = {
    tiempoMaximoMs: 5000,
    complejidadMaxima: 1000,
    profundidadMaxima: 10,
    rateLimitPorMinuto: 100
};

export const DEFAULT_QUERY_COMPLEXITY: number = 540;
