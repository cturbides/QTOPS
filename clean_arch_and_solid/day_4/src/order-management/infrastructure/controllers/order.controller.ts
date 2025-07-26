import { injectable } from 'inversify';
import { CreateOrderInput } from '@order-management/application/dto/create-order.input';
import { CreateOrderUseCase } from '@order-management/application/use-cases/create-order.use-case';

@injectable()
export class OrderController {
    constructor(private readonly createOrderUseCase: CreateOrderUseCase) { }

    async create(req: any, res: any) {
        try {
            if (!req.body) {
                return res.status(400).json({ success: false, message: 'Invalid input data' });
            }

            console.log('Received order creation request:', req.body);

            const input: CreateOrderInput = req.body;
            const order = await this.createOrderUseCase.execute(input);
            return res.status(201).json({ success: true, data: order });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
