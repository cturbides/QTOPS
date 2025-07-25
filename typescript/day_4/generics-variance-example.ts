// Task: Extiende este sistema para incluir variance-aware
//  event processing donde different event types pueden ser processed
//  por the same generic event processor


// Sistema de data processing con generics avanzados y variance
// Base types para demonstration
interface Entity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface User extends Entity {
    email: string;
    name: string;
    role: 'admin' | 'user';
}

interface Product extends Entity {
    name: string;
    price: number;
    category: string;
}

interface Order extends Entity {
    userId: string;
    productIds: string[];
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
}


// Codigo nuevo
// Real reason for this workaround is because declaration merging problem with JS Event type.

// Ignore this: For unknown reason, the following interface is being confused with JS Event type.
// This is a workaround to ensure they are treated as events (using this interface).
interface mEvent {
    id: string;
    timestamp: Date;
    eventType: string;
}

interface UserEvent extends mEvent {
    userId: string;
    payload: Partial<User>;
    type: 'user.created' | 'user.updated';
}

interface ProductEvent extends mEvent {
    userId: string;
    payload: Partial<Product>;
    type: 'product.created' | 'product.updated';
}

interface OrderEvent extends mEvent {
    userId: string;
    payload: Partial<Order>;
    type: 'order.created' | 'order.updated';
}

interface EventProcessor<T extends mEvent> {
    process(events: T[]): Promise<ProcessingResult<T>>;
    transform<U>(events: T[], transformer: (item: T) => U): U[]
}

class BaseEventProcessor<T extends mEvent> implements EventProcessor<T> {
    constructor(
        private handler: (event: T) => Promise<void> = async () => { }
    ) { }

    async process(events: T[]): Promise<ProcessingResult<T>> {
        const handledEvent: T[] = [];
        const errors: ProcessingError<T>[] = [];
        const startTime = Date.now();

        for (const event of events) {
            try {
                await this.handler(event);
                handledEvent.push(event);
            } catch (error) {
                errors.push({
                    item: event,
                    error: (error as Error).message,
                    code: 'PROCESSING_ERROR'
                });
            }
        }

        const duration = Date.now() - startTime;

        return {
            errors: errors,
            processed: handledEvent,
            summary: {
                duration: duration,
                total: events.length,
                failed: errors.length,
                successful: handledEvent.length,
            }
        };
    }

    transform<U>(events: T[], transformer: (item: T) => U): U[] {
        return events.map(transformer);
    }
}

type EventMap = {
    UserEvent: UserEvent;
    OrderEvent: OrderEvent;
    ProductEvent: ProductEvent;
}

type EventName = keyof EventMap;
type EventByName<N extends EventName> = EventMap[N];

const eventProcessorMap: {
    [K in EventName]: new () => EventProcessor<EventMap[K]>;
} = {
    UserEvent: BaseEventProcessor<UserEvent>,
    OrderEvent: BaseEventProcessor<OrderEvent>,
    ProductEvent: BaseEventProcessor<ProductEvent>,
};

class EventProcessorFactory {
    static create<N extends EventName>(
        name: N,
        customHandler?: (e: EventByName<N>) => Promise<void>
    ): EventProcessor<EventByName<N>> {
        if (customHandler) {
            return new BaseEventProcessor<EventByName<N>>(customHandler);
        }

        return new eventProcessorMap[name]();
    }
}

// =============================================
// =============================================
// =============================================
// =============================================

// Generic processor con variance
interface DataProcessor<T> {
    process(data: T[]): Promise<ProcessingResult<T>>;
    validate(item: T): ValidationResult;
    transform<U>(data: T[], transformer: (item: T) => U): U[];
}

interface ProcessingResult<out T> {
    processed: T[];
    errors: ProcessingError<T>[];
    summary: ProcessingSummary;
}

interface ProcessingError<out T> {
    item: T;
    error: string;
    code: string;
}

interface ProcessingSummary {
    total: number;
    successful: number;
    failed: number;
    duration: number;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// Generic implementation con constraints
class BaseDataProcessor<T extends Entity> implements DataProcessor<T> {
    constructor(
        private validator: (item: T) => ValidationResult,
        private businessRules: BusinessRule<T>[] = []
    ) { }

    async process(data: T[]): Promise<ProcessingResult<T>> {
        const startTime = Date.now();
        const processed: T[] = [];
        const errors: ProcessingError<T>[] = [];

        for (const item of data) {
            try {
                // Validate item
                const validation = this.validate(item);
                if (!validation.isValid) {
                    errors.push({
                        item,
                        error: validation.errors.join(', '),
                        code: 'VALIDATION_ERROR'
                    });
                    continue;
                }

                // Apply business rules
                const processedItem = await this.applyBusinessRules(item);
                processed.push(processedItem);

            } catch (error) {
                errors.push({
                    item,
                    error: (error as Error).message,
                    code: 'PROCESSING_ERROR'
                });
            }
        }

        const duration = Date.now() - startTime;

        return {
            processed,
            errors,
            summary: {
                total: data.length,
                successful: processed.length,
                failed: errors.length,
                duration
            }
        };
    }

    validate(item: T): ValidationResult {
        const errors: string[] = [];

        // Basic entity validation
        if (!item.id) errors.push('ID is required');
        if (!item.createdAt) errors.push('Created date is required');
        if (!item.updatedAt) errors.push('Updated date is required');

        // Custom validation
        const customValidation = this.validator(item);
        if (!customValidation.isValid) {
            errors.push(...customValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    transform<U>(data: T[], transformer: (item: T) => U): U[] {
        return data.map(transformer);
    }

    private async applyBusinessRules(item: T): Promise<T> {
        let processedItem = { ...item };

        for (const rule of this.businessRules) {
            processedItem = await rule.apply(processedItem);
        }

        return processedItem;
    }
}

// Business rule interface
interface BusinessRule<T> {
    name: string;
    apply(item: T): Promise<T>;
}

// Specific processors con type safety
class UserProcessor extends BaseDataProcessor<User> {
    constructor() {
        super(
            (user: User) => ({
                isValid: user.email.includes('@') && user.name.length > 0,
                errors: [
                    ...(user.email.includes('@') ? [] : ['Invalid email format']),
                    ...(user.name.length > 0 ? [] : ['Name is required'])
                ]
            }),
            [
                {
                    name: 'normalizeEmail',
                    async apply(user: User): Promise<User> {
                        return {
                            ...user,
                            email: user.email.toLowerCase().trim()
                        };
                    }
                },
                {
                    name: 'updateTimestamp',
                    async apply(user: User): Promise<User> {
                        return {
                            ...user,
                            updatedAt: new Date()
                        };
                    }
                }
            ]
        );
    }
}

class ProductProcessor extends BaseDataProcessor<Product> {
    constructor() {
        super(
            (product: Product) => ({
                isValid: product.price > 0 && product.name.length > 0,
                errors: [
                    ...(product.price > 0 ? [] : ['Price must be positive']),
                    ...(product.name.length > 0 ? [] : ['Name is required'])
                ]
            }),
            [
                {
                    name: 'normalizeName',
                    async apply(product: Product): Promise<Product> {
                        return {
                            ...product,
                            name: product.name.trim()
                        };
                    }
                },
                {
                    name: 'roundPrice',
                    async apply(product: Product): Promise<Product> {
                        return {
                            ...product,
                            price: Math.round(product.price * 100) / 100
                        };
                    }
                }
            ]
        );
    }
}

class OrderProcessor extends BaseDataProcessor<Order> {
    constructor() {
        super(
            (order: Order) => ({
                isValid:
                    typeof order.userId === 'string' &&
                    Array.isArray(order.productIds) &&
                    order.productIds.length > 0 &&
                    typeof order.total === 'number' &&
                    order.total >= 0 &&
                    ['pending', 'completed', 'cancelled'].includes(order.status),
                errors: [
                    ...(typeof order.userId === 'string' ? [] : ['userId is required']),
                    ...(Array.isArray(order.productIds) && order.productIds.length > 0 ? [] : ['At least one productId is required']),
                    ...(typeof order.total === 'number' && order.total >= 0 ? [] : ['Total must be a non-negative number']),
                    ...(order.status === 'pending' || order.status === 'completed' || order.status === 'cancelled'
                        ? []
                        : ['Invalid status'])
                ]
            }),
            [
                {
                    name: 'updateTimestamp',
                    async apply(order: Order): Promise<Order> {
                        return {
                            ...order,
                            updatedAt: new Date()
                        };
                    }
                }
            ]
        );
    }
}


/*
* Codigo nuevo
*/
type EntitiesMap = {
    User: User;
    Order: Order;
    Product: Product;
};

type EntityName = keyof EntitiesMap;
type EntityByName<N extends EntityName> = EntitiesMap[N];

const processorMap: {
    [K in EntityName]: new () => DataProcessor<EntitiesMap[K]>;
} = {
    User: UserProcessor,
    Order: OrderProcessor,
    Product: ProductProcessor,
};

class ProcessorFactory {
    static createProcessor<N extends EntityName>(
        name: N,
        customValidator?: (i: EntityByName<N>) => ValidationResult,
        customRules?: BusinessRule<EntityByName<N>>[]
    ): DataProcessor<EntityByName<N>> {
        if (customValidator || customRules) {
            return new BaseDataProcessor<EntityByName<N>>(
                customValidator ?? (() => ({ isValid: true, errors: [] })),
                customRules ?? []
            );
        }

        return new processorMap[name]();
    }
}

// Usage con complete type safety
async function demonstrateGenericProcessing() {
    // User processing
    const userProcessor = ProcessorFactory.createProcessor('User');
    const users: User[] = [
        {
            id: 'user1',
            email: 'JOHN@EXAMPLE.COM',
            name: 'John Doe',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'user2',
            email: 'invalid-email',
            name: '',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const userResult = await userProcessor.process(users);
    console.log('User processing result:', userResult);

    // Product processing
    const productProcessor = ProcessorFactory.createProcessor('Product');
    const products: Product[] = [
        {
            id: 'product1',
            name: '  Laptop  ',
            price: 999.999,
            category: 'Electronics',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'product2',
            name: '',
            price: -100,
            category: 'Invalid',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const productResult = await productProcessor.process(products);
    console.log('Product processing result:', productResult);

    // Generic transformations
    const userSummaries = userProcessor.transform(users, user => ({
        id: user.id,
        displayName: user.name,
        isAdmin: user.role === 'admin'
    }));

    console.log('User summaries:', userSummaries);
}

// Codigo nuevo
async function demonstrateEventProcessing() {
    const userEvents: UserEvent[] = [
        {
            eventType: 'User',
            id: 'event1',
            timestamp: new Date(),
            userId: 'user1',
            payload: { email: 'alice@example.com' },
            type: 'user.created',
        },
        {
            eventType: 'User',
            id: 'event2',
            timestamp: new Date(),
            userId: 'user2',
            payload: { name: 'Bob' },
            type: 'user.updated',
        }
    ];

    const userEventProcessor = EventProcessorFactory.create('UserEvent');
    const result = await userEventProcessor.process(userEvents);

    console.log('User Event Results:', result);
}

demonstrateGenericProcessing();
demonstrateEventProcessing().then(() => console.log('Event processing completed'));
