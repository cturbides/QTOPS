import { CursoCompleto } from "../entities/curso-completo.entity";

export class GetCursoCompletoConEvaluacionesDto {
    promedio: number;
    curso: CursoCompleto;
    totalEvaluaciones: number;
}