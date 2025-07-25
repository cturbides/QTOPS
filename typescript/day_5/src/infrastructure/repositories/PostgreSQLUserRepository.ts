import { Config } from '@infrastructure/config';
import { UserRepository, User } from '@domain/index';

export class PostgreSQLUserRepository implements UserRepository {
    constructor(private dbConfig: Config.DatabaseConfig) { }

    async findById(id: string): Promise<User & { createdAt: Date, updatedAt: Date } | null> {
        console.log(`Fetching user ${id} from DB at ${this.dbConfig.url}`);

        return {
            id,
            name: 'Dummy User',
            email: 'dummy@example.com',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async save(user: User): Promise<void> {
        console.log(`Saving user ${user.email} to DB`);
    }
}