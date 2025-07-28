import { PickType } from '@nestjs/mapped-types';
import { IsString, IsNumber, Min } from 'class-validator';
import { Product } from '@products/entities/product.entity';

export class CreateProductDto extends PickType(Product, ['name', 'price', 'stock'] as const) {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    stock: number;
}
