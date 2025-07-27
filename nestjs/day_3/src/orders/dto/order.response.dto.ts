import { PickType } from "@nestjs/mapped-types";
import { Order } from "@orders/entities/order.entity";

export class OrderResponseDto extends PickType(
    Order,
    ['id', 'product', 'quantity', 'totalPrice', 'createdAt'] as const
) { }