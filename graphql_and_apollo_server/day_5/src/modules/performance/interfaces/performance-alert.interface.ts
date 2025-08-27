import { PerformanceType } from "./performance-type.enum";

export interface IPerformanceAlert {
    valor: number;
    umbral: number;
    contexto?: any;
    timestamp: Date;
    operacion: string;
    tipo: PerformanceType;
}

