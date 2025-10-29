import { UserRepository } from '../repositories/UserRepository';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario a eliminar
   * @returns Promise<void>
   * @throws Error si el ID es inválido o el usuario no existe
   */
  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('User ID is required');
    }

    // Delegar al repositorio
    await this.userRepository.deleteUser(id);
  }
}
