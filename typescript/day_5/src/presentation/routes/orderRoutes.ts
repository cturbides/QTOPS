import { Config } from '@infrastructure/config';
import { Router, Request, Response } from 'express';
import { OrderController } from '@presentation/index';
import { OrderApplicationService } from '@application/index';
import { PostgreSQLOrderRepository } from '@infrastructure/repositories/PostgreSQLOrderRepository';

const config = Config.loadConfig();
const orderRepo = new PostgreSQLOrderRepository(config.database);
const service = new OrderApplicationService(orderRepo);
const controller = new OrderController(service);

// Router
const router = Router();
router.post('/', (req: Request, res: Response) => controller.placeOrder(req, res));

export default router;
