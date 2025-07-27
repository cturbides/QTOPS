import { Transform } from "class-transformer";
import { PickType } from "@nestjs/mapped-types";
import { Product } from "@products/entities/product.entity";
import { IsArray, IsInt, IsNumber, IsString, MaxLength, Min, MinLength } from "class-validator";

export class CreateProductDto extends PickType(Product, ['name', 'price', 'stock', 'tags'] as const) {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }): { value: unknown } => value?.trim())
    name: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Transform(({ value }) => parseFloat(value))
    price: number;

    @IsInt()
    @Min(0)
    @Transform(({ value }) => parseInt(value))
    stock: number;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        if (Array.isArray(value)) {
            return value;
        }

        throw new Error('Invalid tags format');
    })
    @IsArray()
    @IsString({ each: true })
    tags: string[];
}
