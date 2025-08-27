import { IQueryMetrics } from "@modules/performance/interfaces/query-metrics.interface";
import { IPerformanceAlert } from "@modules/performance/interfaces/performance-alert.interface";

export const dataSource = {
    metricas: new Map<string, IQueryMetrics>(),
    alertSubscribers: Array<(alert: IPerformanceAlert) => void>(),
}