export interface RateLimitResult {
  resetTime: number;
  permitida: boolean;
  peticionesRestantes: number;
  complejidadRestante: number;
}
