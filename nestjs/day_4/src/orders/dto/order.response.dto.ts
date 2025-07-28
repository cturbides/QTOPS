import { PickType } from "@nestjs/mapped-types";
import { Order } from "@orders/entities/order.entity";
import { OrderItem } from "@orders/entities/order-item.entity";

export class PickOrderItem extends PickType(
    OrderItem,
    ['quantity'] as const
) {
    productId: string;
    productName: string;
}

export class OrderResponseDto extends PickType(
    Order,
    ['id', 'totalPrice', 'createdAt', 'status'] as const
) {
    items: PickOrderItem[];
}