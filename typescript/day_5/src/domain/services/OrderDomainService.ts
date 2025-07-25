import { Order } from '@domain/entities/Order';

export class OrderDomainService {
    static isValidTotal(order: Order): boolean {
        return order.total >= 0;
    }
}
