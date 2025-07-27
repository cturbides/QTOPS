import { OmitType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { Product } from '@products/entities/product.entity';

export class ProductResponseDto extends OmitType(Product, ['price', 'createdAt'] as const) {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    @Transform(({ value }: { value: unknown }) => Number(value).toFixed(2))
    price: string;

    @Expose()
    stock: number;

    @Expose()
    tags: string[];

    @Expose()
    @Transform(({ value }) => {
        if (value instanceof Date) return value.toISOString();
        try {
            return new Date(value).toISOString();
        } catch {
            return null;
        }
    })
    createdAt: string;
}
