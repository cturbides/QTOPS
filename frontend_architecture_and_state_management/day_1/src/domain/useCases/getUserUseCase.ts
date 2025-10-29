import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario a buscar
   * @returns Promise<User> - Usuario encontrado
   * @throws Error si el ID es inválido o el usuario no existe
   */
  async execute(id: string): Promise<User> {
    if (!id || id.trim() === '') {
      throw new Error('User ID is required');
    }

    // Delegar al repositorio
    return this.userRepository.getUser(id);
  }
}
