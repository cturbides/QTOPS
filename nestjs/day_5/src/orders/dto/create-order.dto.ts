import { Type } from 'class-transformer';
import { IsInt, Min, IsUUID, ArrayNotEmpty, ValidateNested, IsArray } from 'class-validator';

export class OrderItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}