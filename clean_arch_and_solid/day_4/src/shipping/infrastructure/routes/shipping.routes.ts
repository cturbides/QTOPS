import { Router } from 'express';
import { container } from '@main/container';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { ShipmentController } from '@shipping/infrastructure/controllers/shipment.controller';

const router = Router();

const controller = container.get<ShipmentController>(CONTAINER_TOKENS.ShipmentController);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.findAll(req, res));

export { router as shippingRoutes };
