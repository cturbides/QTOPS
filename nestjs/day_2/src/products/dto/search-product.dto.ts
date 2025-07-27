import { Transform } from "class-transformer";
import { IsOptional, IsNumber, Min, IsString, IsArray, IsIn } from "class-validator";

export class SearchProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseFloat(value))
    minPrice?: number;


    @IsOptional()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => parseFloat(value))
    maxPrice?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean);
        }
        return Array.isArray(value) ? value : [];
    })
    tags?: string[];

    @IsOptional()
    @IsString()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC';
}