export interface IQueryMetrics {
    errorCount: number;
    tiempoMaximo: number;
    tiempoMinimo: number;
    ultimaEjecucion: Date;
    tiempoPromedio: number;
    totalEjecuciones: number;
    complejidadPromedio?: number;
}
