import { Transform } from "class-transformer";
import { PickType } from "@nestjs/mapped-types";
import { Product } from "@products/entities/product.entity";
import { IsArray, IsInt, IsNumber, IsString, Min } from "class-validator";

export class CreateProductDto extends PickType(Product, ['name', 'price', 'stock', 'tags'] as const) {
    @IsString()
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

    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(tag => tag.trim()).filter(Boolean);
        }
        return Array.isArray(value) ? value : [];
    })
    tags: string[];
}
