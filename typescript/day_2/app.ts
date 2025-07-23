// Task: Extiende este sistema para incluir un decorator @Transaction()
//  que maneje database transactions automáticamente.

import 'reflect-metadata';

/*
    Codigo nuevo
*/
class DbHandler {
    private static instance: DbHandler;

    private data: Map<string, any> = new Map();
    private tempData: Map<string, any> | null = null;
    private inTransaction: boolean = false;

    public constructor() { }

    public static getInstance(): DbHandler {
        if (!DbHandler.instance) {
            DbHandler.instance = new DbHandler();
        }
        return DbHandler.instance;
    }


    async beginTransaction() {
        if (this.inTransaction) {
            console.warn('[DB] Transaction already started');
            return;
        }

        this.tempData = new Map(this.data);
        this.inTransaction = true;
        console.log('[DB] Transaction started');
    }

    async commitTransaction() {
        if (!this.inTransaction || !this.tempData) {
            console.warn('[DB] No transaction to commit');
            return;
        }

        this.data = this.tempData;
        this.tempData = null;
        this.inTransaction = false;
        console.log('[DB] Transaction committed');
    }

    async rollbackTransaction() {
        if (!this.inTransaction) {
            console.warn('[DB] No transaction to rollback');
            return;
        }

        this.tempData = null;
        this.inTransaction = false;
        console.log('[DB] Transaction rolled back');
    }

    async clean() {
        this.tempData = null;
        this.inTransaction = false;
        console.log('[DB] Cleanup done');
    }

    async save(key: string, value: any) {
        const target = this.inTransaction ? this.tempData! : this.data;
        target.set(key, value);
        console.log(`[DB] Saved key: ${key}`);
    }

    async find(key: string): Promise<any> {
        const target = this.inTransaction ? this.tempData! : this.data;
        const value = target.get(key);
        console.log(`[DB] Read key: ${key} ->`, value);
        return value;
    }

    async delete(key: string) {
        const target = this.inTransaction ? this.tempData! : this.data;
        target.delete(key);
        console.log(`[DB] Deleted key: ${key}`);
    }
}

class DbService {
    private static instance: DbService;

    private readonly db: DbHandler;

    constructor() {
        this.db = DbHandler.getInstance();
    }

    public static getInstance(): DbService {
        if (!DbService.instance) {
            DbService.instance = new DbService();
        }

        return DbService.instance;
    }

    public async save(value: any, key?: string) {
        if (!key || (typeof value == "object" && value?.key)) {
            throw new Error("No key found");
        }

        await this.db.save(key ?? value?.key, value);

        return (typeof value === "object") ? {
            ...value,
            key: value?.key ?? key,
        } : {
            data: value,
            key: key,
        };
    }

    public async find(key: string) {
        return await this.db.find(key);
    }

    public async delete(key: string) {
        return await this.db.delete(key);
    }
}

class TransactionHandler {
    private readonly dbHandler: DbHandler;
    private readonly transactionName: string;
    private readonly originalFunctionName: string;
    private readonly originalFunction: (...args: unknown[]) => unknown | unknown[];

    public constructor(func: (...args: unknown[]) => unknown | unknown[], originalFunctionName: string, transactionName?: string) {
        this.originalFunction = func;
        this.dbHandler = DbHandler.getInstance();
        this.originalFunctionName = originalFunctionName;
        this.transactionName = transactionName ?? "transaction";
    }

    public async execute(...args: unknown[]) {
        console.debug(`[TRANSACTION] Executing "${this.originalFunctionName}" with transaction "${this.transactionName}"`);

        try {
            await this.prepareTransaction();
            const result: unknown = await this.originalFunction.apply(this, args);
            await this.commitTransaction();

            return result;
        } catch (error) {
            await this.rollbackTransaction();
            throw error;
        } finally {
            this.cleanTempData();
        }
    }

    private async prepareTransaction(): Promise<void> {
        console.debug(`[TRANSACTION] Preparing transaction "${this.transactionName}" for "${this.originalFunctionName}"`);

        await this.dbHandler.beginTransaction();
    }

    private async commitTransaction(): Promise<void> {
        console.debug(`[TRANSACTION] Committing transaction "${this.transactionName}" for "${this.originalFunctionName}"`);

        await this.dbHandler.commitTransaction();
    }

    private async rollbackTransaction(): Promise<void> {
        console.warn(`[TRANSACTION] Rolling back transaction "${this.transactionName}" for "${this.originalFunctionName}"`);

        await this.dbHandler.rollbackTransaction();
    }

    private async cleanTempData(): Promise<void> {
        console.debug(`[TRANSACTION] Cleaning temporary data after "${this.originalFunctionName}"`);

        await this.dbHandler.clean();
    }
}

function Transaction(transactionName?: string) {
    return function (target: unknown, functionName: string, descriptor: PropertyDescriptor) {
        const originalMethod: (...args: unknown[]) => unknown | unknown[] = descriptor.value as (...args: unknown[]) => unknown | unknown[];

        descriptor.value = async function (...args: unknown[]) {
            const transactionHandler = new TransactionHandler(originalMethod.bind(this), functionName, transactionName);
            return await transactionHandler.execute(...args);
        }

        return descriptor;
    }

}

//  ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ==========
//  ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ==========
//  ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ==========
//  ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ===== ==========

// Validation decorator con schema support
function Validate(schema: any) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            // Validar argumentos contra schema
            for (let i = 0; i < args.length; i++) {
                const result = schema.validate(args[i]);
                if (result.error) {
                    throw new ValidationError(`Validation failed for parameter ${i}: ${result.error.message}`);
                }
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

// Cache decorator con TTL y key generation
function Cache(options: { ttl: number; keyGenerator?: (...args: any[]) => string }) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const cache = new Map<string, { value: any; expiry: number }>();

        descriptor.value = async function (...args: any[]) {
            // Generar cache key
            const key = options.keyGenerator
                ? options.keyGenerator(...args)
                : `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

            // Verificar cache
            const cached = cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                console.log(`Cache hit for key: ${key}`);
                return cached.value;
            }

            // Ejecutar método original
            const result = await originalMethod.apply(this, args);

            // Guardar en cache
            cache.set(key, {
                value: result,
                expiry: Date.now() + (options.ttl * 1000)
            });

            console.log(`Cache miss for key: ${key}, result cached`);
            return result;
        };

        return descriptor;
    };
}

// Logging decorator con performance metrics
function Log(options: { level: 'debug' | 'info' | 'warn' | 'error' } = { level: 'info' }) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();
            const className = target.constructor.name;

            console.log(`[${options.level.toUpperCase()}] ${className}.${propertyKey} called with args:`, args);

            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;

                console.log(`[${options.level.toUpperCase()}] ${className}.${propertyKey} completed in ${duration}ms`);
                return result;

            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[ERROR] ${className}.${propertyKey} failed after ${duration}ms:`, error);
                throw error;
            }
        };

        return descriptor;
    };
}

// Retry decorator para resilience
function Retry(options: { attempts: number; delay: number; backoff?: number }) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let lastError: Error;

            for (let attempt = 1; attempt <= options.attempts; attempt++) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    lastError = error as Error;

                    if (attempt === options.attempts) {
                        throw error;
                    }

                    const delay = options.delay * Math.pow(options.backoff || 1, attempt - 1);
                    console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }

            throw lastError!;
        };

        return descriptor;
    };
}

// Schema simple para validation
const CreateUserSchema = {
    validate: (data: any) => {
        if (!data || typeof data !== 'object') {
            return { error: { message: 'Data must be an object' } };
        }

        if (!data.email || typeof data.email !== 'string') {
            return { error: { message: 'Email is required and must be a string' } };
        }

        if (!data.name || typeof data.name !== 'string') {
            return { error: { message: 'Name is required and must be a string' } };
        }

        return { error: null };
    }
};

// Service usando decorators
class UserService {
    private readonly dbService: DbService;

    constructor() {
        this.dbService = DbService.getInstance();
    }

    @Log({ level: 'info' })
    @Cache({
        ttl: 300,
        keyGenerator: (email: string) => `user:email:${email}`
    })
    @Retry({ attempts: 3, delay: 1000, backoff: 2 })
    async findByEmail(email: string): Promise<User | null> {
        // Simular operación que puede fallar
        if (Math.random() < 0.5) {
            throw new Error('Database connection failed');
        }

        // Simular delay de database
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            id: '1',
            email,
            name: 'John Doe',
            createdAt: new Date()
        };
    }

    @Log({ level: 'info' })
    @Cache({ ttl: 600, keyGenerator: () => 'users:count' })
    @Transaction('create-user')
    @Retry({ attempts: 3, delay: 1000, backoff: 2 })
    @Validate(CreateUserSchema)
    async createUser(userData: { email: string; name: string }): Promise<User> {
        // Business logic puro
        const user: User = {
            id: `user_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            createdAt: new Date()
        };

        console.log('Creating user:', user);

        // Simular operación que puede fallar
        if (Math.random() < 0.8) {
            throw new Error('Database connection failed');
        }

        await this.dbService.save(user, user.id);

        return user;
    }
}

// Interfaces
interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Uso del service
async function demonstrateDecorators() {
    const userService = new UserService();

    try {
        // Test validation
        await userService.createUser({ email: 'john@example.com', name: 'John Doe' });

        // Test caching y retry
        const user = await userService.findByEmail('john@example.com');
        console.log('Found user:', user);

        // Second call should hit cache
        const cachedUser = await userService.findByEmail('john@example.com');
        console.log('Cached user:', cachedUser);

    } catch (error) {
        console.error('Error:', error);
    }
}

demonstrateDecorators()
