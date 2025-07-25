import { User } from '@domain/entities/User';
import { eventBus } from '@shared/utils/EventBus';
import { Adapters } from '@infrastructure/adapters';
import { UserRepository } from '@domain/repositories/UserRepository';
import { CreateUserRequest } from '@application/dtos/CreateUserRequest';
import { UserCreatedEvent } from '@application/events/UserCreatedEvent';

export class UserApplicationService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailAdapter: Adapters.EmailAdapter,
        private readonly cacheAdapter: Adapters.CacheAdapter
    ) { }

    async createUser(request: CreateUserRequest): Promise<User> {
        const user = {
            id: request.id,
            role: request.role,
            name: request.name,
            email: request.email,
        } as User;

        await this.userRepository.save(user);
        await this.emailAdapter.sendEmail(user.email, 'welcome-template', { name: user.name });

        const event = new UserCreatedEvent(user.id, user.email);

        // Added code
        await eventBus.emit('user.created', event);

        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        const cached = await this.cacheAdapter.get<User>(`user:${id}`);
        if (cached) return cached;

        const user = await this.userRepository.findById(id);
        if (user) {
            await this.cacheAdapter.set(`user:${id}`, user);
        }

        return user;
    }
}
