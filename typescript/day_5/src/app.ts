// Task Extiende este sistema para incluir un módulo de eventos que
//  use declaration merging para crear type-safe event handlers.

import express from 'express';
import { Config } from '@infrastructure/config';
import { Adapters } from '@infrastructure/adapters';
import { Middleware } from '@presentation/middleware';

// Import routes
import userRoutes from '@presentation/routes/userRoutes';
import orderRoutes from '@presentation/routes/orderRoutes';
import { ExpressError } from '@shared/types/express';

// Import EventBus and types
import { eventBus } from '@shared/utils/EventBus';
import { UserCreatedEvent } from '@application/events/UserCreatedEvent';
import { OrderPlacedEvent } from '@application/events/OrderPlacedEvent';

// Load configuration
const config = Config.loadConfig();

// Initialize adapters (can be injected into services if needed later)
const emailAdapter = new Adapters.SendGridEmailAdapter(config.email);
const cacheAdapter = new Adapters.RedisAdapter(config.redis);

// Initialize Express app
const app = express();

// Global middleware
app.use(express.json());
app.use(Middleware.correlationId);
app.use(Middleware.requestTiming);
app.use(Middleware.responseHelpers);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Global error handler
app.use((error: ExpressError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.error(error.message, error.statusCode || 500, {
        code: error.code,
        details: error.details
    });
});

// Codigo agregado
eventBus.on('user.created', (event: UserCreatedEvent) => {
    console.log(`\t=) User created: ${event.email}`);
});

eventBus.on('order.placed', async (event: OrderPlacedEvent) => {
    console.log(`\t=) Order placed by user ${event.userId}, order ID: ${event.orderId}`);
});

// ============================================================================================

app.listen(config.port, () => {
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
    console.log(`Database connected at ${config.database.url}`);
    console.log(`Email service initialized with from address: ${config.email.fromAddress}`);
    console.log(`Redis cache connected at ${config.redis.url}`);
});

export default app;
