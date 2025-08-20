import { CursoCompleto } from "@curso-completo/entities/curso-completo.entity";

export class GetCursoCompletoConEvaluacionesDto {
    promedio: number;
    curso: CursoCompleto;
    totalEvaluaciones: number;
}