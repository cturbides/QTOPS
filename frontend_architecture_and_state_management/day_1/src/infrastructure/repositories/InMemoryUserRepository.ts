import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/valueObjects/Email';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private nextId: number = 1;

  constructor() {
    this.seedData();
  }

  /**
   * Implementa getUser del contrato UserRepository
   */
  async getUser(id: string): Promise<User> {
    const user = this.users.get(id);
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    await this.simulateDelay(100);
    
    return user;
  }

  /**
   * Implementa getAllUsers del contrato UserRepository
   */
  async getAllUsers(): Promise<User[]> {
    await this.simulateDelay(150);
    return Array.from(this.users.values());
  }

  /**
   * Implementa createUser del contrato UserRepository
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      name: userData.name,
      email: userData.email,
    };

    this.users.set(newUser.id, newUser);
    
    await this.simulateDelay(200);
    
    return newUser;
  }

  /**
   * Implementa updateUser del contrato UserRepository
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const existingUser = await this.getUser(id);
    
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      id: existingUser.id, // El ID nunca cambia
    };

    this.users.set(id, updatedUser);
    
    await this.simulateDelay(150);
    
    return updatedUser;
  }

  /**
   * Implementa deleteUser del contrato UserRepository
   */
  async deleteUser(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }

    this.users.delete(id);
    
    await this.simulateDelay(100);
  }

  /**
   * Métodos auxiliares privados
   */
  private generateId(): string {
    return `user_${this.nextId++}`;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private seedData(): void {
    const seedUsers: Array<{ id: string; name: string; email: string }> = [
      { id: 'user_1', name: 'Juan Pérez', email: 'juan.perez@example.com' },
      { id: 'user_2', name: 'María García', email: 'maria.garcia@example.com' },
      { id: 'user_3', name: 'Carlos López', email: 'carlos.lopez@example.com' },
    ];

    seedUsers.forEach(userData => {
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: Email.create(userData.email),
      };
      this.users.set(user.id, user);
    });

    this.nextId = 4;
  }
}
