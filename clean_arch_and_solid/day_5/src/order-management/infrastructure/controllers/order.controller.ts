import { injectable } from 'inversify';
import { CreateOrderInput } from '@order-management/application/dto/create-order.input';
import { CreateOrderUseCase } from '@order-management/application/use-cases/create-order.use-case';
import { ProcessOrderUseCase } from '@order-management/application/use-cases/process-order.use.case';

@injectable()
export class OrderController {
    constructor(private readonly createOrderUseCase: CreateOrderUseCase, private readonly processOrderUseCase: ProcessOrderUseCase) { }

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

    async process(req: any, res: any) {
        try {
            if (!req.body) {
                return res.status(400).json({ success: false, message: 'Invalid input data' });
            }

            const orderId = req.params.id;

            if (!orderId) {
                return res.status(400).json({ success: false, message: 'Order ID is required' });
            }

            console.log(`Processing order with ID: ${orderId}`);

            const paymentDetails = req.body;
            const result = await this.processOrderUseCase.execute({
                orderId: orderId,
                paymentDetails: paymentDetails,
            });

            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
