import { Request, Response } from 'express';
import { OrderApplicationService, CreateOrderRequest } from '@application/index';

export class OrderController {
    constructor(private readonly orderService: OrderApplicationService) { }

    async placeOrder(req: Request, res: Response): Promise<void> {
        try {
            const dto: CreateOrderRequest = req.body;
            const order = await this.orderService.placeOrder(dto);
            res.success(order, 'Order placed successfully');
        } catch (error) {
            res.error('Failed to place order', 500, error);
        }
    }
}
