export interface IGraphQLBenchmarkResult {
  minimo: number;
  maximo: number;
  promedio: number;
  operacion: string;
  tiempos: number[];
  percentil95: number;
  percentil99: number;
  iteraciones: number;
  desviacionEstandar: number;
  operacionesPorSegundo: number;
}

export interface IBenchmarkConfig {
  timeoutMs: number;
  iteraciones: number;
  concurrencia: number;
  warmupIteraciones: number;
}
