export interface IBenchmarkResult {
    minimo: number;
    maximo: number;
    promedio: number;
    percentil95: number;
    percentil99: number;
    desviacionEstandar: number;
    operacionesPorSegundo: number;
}