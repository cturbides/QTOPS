import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CursoCompletoAdvanceSearchDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    textoBusqueda?: string;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @Min(0)
    offset?: number;
}
