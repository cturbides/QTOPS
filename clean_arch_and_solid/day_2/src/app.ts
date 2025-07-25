// Task: Implementa una nueva clase PushChannel que cumpla con el contrato de NotificationChannel
//  y puede ser utilizada intercambiablemente con las implementaciones existentes.

import 'reflect-metadata';
import * as crypto from 'crypto';
import { Container } from 'inversify';
import { validate as isUUID } from 'uuid';

// ISP: Interfaces segregadas y específicas
interface Readable<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
}

interface Writable<T> {
    save(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
}

interface Repository<T> extends Readable<T>, Writable<T> { }

// DIP: Abstracción para el servicio de dominio
interface NotificationChannel {
    send(message: string, recipient: string): Promise<boolean>;
}

// LSP: Implementaciones que mantienen el contrato
class EmailChannel implements NotificationChannel {
    async send(message: string, recipient: string): Promise<boolean> {
        if (!recipient.includes('@')) {
            throw new Error('Email inválido'); // Mantiene precondiciones
        }
        console.log(`Email enviado a ${recipient}: ${message}`);
        return true;
    }
}

class SMSChannel implements NotificationChannel {
    async send(message: string, recipient: string): Promise<boolean> {
        if (!recipient.match(/^\+?[\d\s-]+$/)) {
            throw new Error('Teléfono inválido'); // Mantiene precondiciones
        }
        console.log(`SMS enviado a ${recipient}: ${message}`);
        return true;
    }
}

// ==================================================================================
// Nuevo codigo
class PushChannel implements NotificationChannel {
    async send(message: string, recipient: string): Promise<boolean> {
        if (!isUUID(recipient)) {
            throw new Error('Recipient debe ser un UUID válido'); // Mantiene precondiciones
        }

        await Promise.resolve(); // Simula una operación asíncrona
        console.log(`Push notification enviado a ${recipient}: ${message}`);

        return true;
    }
}

const ValidateUUID = (): MethodDecorator => {
    return (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
        const originalMethod: Function = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            if (!args?.length) {
                throw new Error('ID no proporcionado');
            }

            const candidate =
                typeof args[0] === 'string'
                    ? args[0]
                    : typeof args[0] === 'object'
                        ? args[0]?.id
                        : null;

            if (!candidate || !isUUID(candidate)) {
                throw new Error('ID inválido (no es UUID)');
            }

            return originalMethod.apply(this, args);
        };
    }
};

class UserRepository implements Repository<User> {
    private users: Map<string, User> = new Map();

    @ValidateUUID()
    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findAll(): Promise<User[]> {
        return Array.from(this.users.values());
    }

    @ValidateUUID()
    async save(user: User): Promise<void> {
        if (!user?.id) {
            user.id = crypto.randomUUID();
        }


        this.users.set(user.id, user);
    }

    @ValidateUUID()
    async delete(id: string): Promise<void> {
        this.users.delete(id);
    }
}

// Dependencies
interface User {
    id: string;
    email: string;
    phone: string;
}

enum CHANNELS {
    SMS = 'sms',
    Push = 'push',
    Email = 'email'
};

class RecipientService {
    static retrieveRecipient(user: User, channel: CHANNELS): string {
        switch (channel) {
            case CHANNELS.SMS:
                return user.phone;
            case CHANNELS.Push:
                return user.id;
            case CHANNELS.Email:
                return user.email;
            default:
                throw new Error('Canal no soportado');
        }
    }
}

// ==================================================================================
// ==================================================================================
// ==================================================================================
// ==================================================================================
// ==================================================================================

// Servicio que depende de abstracciones (DIP)
class NotificationService {
    constructor(
        private channels: Map<CHANNELS, NotificationChannel>,
        private userRepo: Repository<User>
    ) { }


    async notifyUser(userId: string, message: string): Promise<void> {
        const user = await this.userRepo.findById(userId);

        if (!user) throw new Error('Usuario no encontrado');

        // LSP en acción: cualquier implementación de NotificationChannel funciona
        for (const [type, channel] of this.channels) {
            try {
                const recipient = RecipientService.retrieveRecipient(user, type);
                await channel.send(message, recipient);
            } catch (error) {
                console.error(`Error enviando ${type}:`, error);
            }
        }
    }
}

async function demonstrateNotificationService() {
    const user: User = {
        phone: '+1234567890',
        id: crypto.randomUUID(),
        email: 'user@example.com',
    };

    const container = new Container();
    container.bind<NotificationChannel>('SMSChannel').to(SMSChannel).inSingletonScope();
    container.bind<NotificationChannel>('PushChannel').to(PushChannel).inSingletonScope();
    container.bind<NotificationChannel>('EmailChannel').to(EmailChannel).inSingletonScope();
    container.bind<Repository<User>>('UserRepository').to(UserRepository).inSingletonScope();

    const userRepository: Repository<User> = container.get<Repository<User>>('UserRepository');
    await userRepository.save(user);

    const notificationService: NotificationService = new NotificationService(
        new Map([
            [CHANNELS.SMS, container.get<NotificationChannel>('SMSChannel')],
            [CHANNELS.Push, container.get<NotificationChannel>('PushChannel')],
            [CHANNELS.Email, container.get<NotificationChannel>('EmailChannel')]
        ]),
        container.get<Repository<User>>('UserRepository')
    );

    await notificationService.notifyUser(user.id, '¡Hola! Este es un mensaje de prueba.');
}

demonstrateNotificationService().then(() => {
    console.log('Demostración completada');
}).catch(console.error);