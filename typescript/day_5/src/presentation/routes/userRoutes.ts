import { Router, Request, Response } from 'express';
import { Config } from '@infrastructure/config';
import { Adapters } from '@infrastructure/adapters';
import { UserApplicationService } from '@application/index';
import { PostgreSQLUserRepository } from '@infrastructure/index';
import { UserController } from '@presentation/controllers/UserController';

const config = Config.loadConfig();
const repo = new PostgreSQLUserRepository(config.database);
const email = new Adapters.SendGridEmailAdapter(config.email);
const cache = new Adapters.RedisAdapter(config.redis);
const service = new UserApplicationService(repo, email, cache);
const controller = new UserController(service);

// Router
const router = Router();
router.post('/', (req: Request, res: Response) => controller.createUser(req, res));
router.get('/:id', (req: Request, res: Response) => controller.getUser(req, res));

export default router;
