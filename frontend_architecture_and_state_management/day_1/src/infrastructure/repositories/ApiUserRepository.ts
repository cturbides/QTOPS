import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/valueObjects/Email';

export class ApiUserRepository implements UserRepository {
  constructor(private readonly apiBaseUrl: string) {}

  /**
   * Implementa getUser del contrato UserRepository
   */
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.apiBaseUrl}/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User with id ${id} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return this.mapApiResponseToUser(data);
  }

  /**
   * Implementa getAllUsers del contrato UserRepository
   */
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.apiBaseUrl}/users`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => this.mapApiResponseToUser(item));
  }

  /**
   * Implementa createUser del contrato UserRepository
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${this.apiBaseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.value, // Extraer el valor del Value Object
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return this.mapApiResponseToUser(data);
  }

  /**
   * Implementa updateUser del contrato UserRepository
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const apiUpdates: any = {};

    if (updates.name !== undefined) {
      apiUpdates.name = updates.name;
    }
    if (updates.email !== undefined) {
      apiUpdates.email = updates.email.value;
    }

    const response = await fetch(`${this.apiBaseUrl}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiUpdates),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User with id ${id} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return this.mapApiResponseToUser(data);
  }

  /**
   * Implementa deleteUser del contrato UserRepository
   */
  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User with id ${id} not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  /**
   * Mapea la respuesta de la API al modelo de dominio
   * 
   * Esta es la capa de traducción entre el mundo externo (API)
   * y el mundo interno (dominio).
   */
  private mapApiResponseToUser(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: Email.create(data.email), // Crear Value Object desde string
    };
  }
}
