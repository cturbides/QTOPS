import { PickType } from '@nestjs/mapped-types';
import { Order } from '@orders/entities/order.entity';
import { IsString, IsInt, Min, IsNumber } from 'class-validator';

export class CreateOrderDto extends PickType(Order, ['product', 'quantity', 'totalPrice'] as const) {
    @IsString()
    product: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    totalPrice: number;
}
