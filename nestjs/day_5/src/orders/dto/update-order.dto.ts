import { Order } from '@orders/entities/order.entity';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { OrderStatus } from '@orders/constants/order-status.enum';
import { IsDecimal, IsEnum, IsOptional, Min } from 'class-validator';

const PickedOrder = PickType(Order, ['status', 'totalPrice'] as const);

export class UpdateOrderDto extends PartialType(PickedOrder) {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @Min(0.01)
    @IsDecimal({ decimal_digits: '2' })
    totalPrice?: number;
}
