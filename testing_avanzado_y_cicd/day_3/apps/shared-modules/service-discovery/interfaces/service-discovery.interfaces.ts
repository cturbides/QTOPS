export interface ServiceConfig {
  name: string;
  host: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
}

export interface ServiceInstance {
  id: string;
  address: string;
  port: number;
  tags?: string[];
  healthy: boolean;
}

export interface EducationalService {
  tipo: string;
  host: string;
  port: number;
  version: string;
  dominio: string;
  capacidades: string[];
  capacidadMaxima: number;
  rateLimitPerMinute: number;
}