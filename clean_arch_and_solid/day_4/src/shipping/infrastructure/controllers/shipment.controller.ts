import { Request, Response } from 'express';
import { CreateShipmentUseCase } from '@shipping/application/use-cases/create-shipment.use-case';
import { InMemoryShipmentRepository } from '@shipping/infrastructure/repositories/shipment.repository.in-memory';

export class ShipmentController {
    constructor(
        private readonly createUseCase: CreateShipmentUseCase,
        private readonly shipmentRepo: InMemoryShipmentRepository
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.body || !req.body.orderId || !req.body.address || !req.body.shippingMethod) {
                throw new Error('Invalid shipment data');
            }

            console.log('Received shipment creation request:', req.body);

            await this.createUseCase.execute(req.body);
            res.status(201).json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async findAll(_req: Request, res: Response): Promise<void> {
        console.log('Fetching all shipments');

        const shipments = await this.shipmentRepo.findAll();
        res.status(200).json({ success: true, data: shipments });
    }
}
