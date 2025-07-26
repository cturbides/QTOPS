import { Router } from 'express';
import { container } from '@main/container';
import { CONTAINER_TOKENS } from '@shared-kernel/constants/container.tokens';
import { OrderController } from '@order-management/infrastructure/controllers/order.controller';

const router = Router();
const controller = container.get<OrderController>(CONTAINER_TOKENS.OrderController);

router.post('/orders', (req, res) => controller.create(req, res));

export { router as orderRoutes };
