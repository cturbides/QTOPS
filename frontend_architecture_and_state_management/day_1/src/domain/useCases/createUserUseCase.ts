import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param userData - Datos del usuario a crear
   * @returns Promise<User> - Usuario creado con ID asignado
   * @throws Error si los datos son inválidos
   */
  async execute(userData: Omit<User, 'id'>): Promise<User> {
    // Validación 1: Nombre requerido
    if (!userData.name || userData.name.trim() === '') {
      throw new Error('User name is required');
    }

    // Validación 2: Nombre con longitud mínima
    if (userData.name.trim().length < 2) {
      throw new Error('User name must be at least 2 characters long');
    }

    // Validación 3: Email debe ser un Email Value Object válido
    if (!userData.email) {
      throw new Error('User email is required');
    }

    return this.userRepository.createUser(userData);
  }
}
