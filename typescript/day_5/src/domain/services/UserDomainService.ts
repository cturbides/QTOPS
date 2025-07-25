import { User } from '@domain/entities/User';

export class UserDomainService {
    static isAdmin(user: User): boolean {
        return user.role === 'admin';
    }
}
