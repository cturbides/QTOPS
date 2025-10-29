import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id - ID del usuario a actualizar
   * @param updates - Campos a actualizar
   * @returns Promise<User> - Usuario actualizado
   * @throws Error si el ID es inválido o el usuario no existe
   */
  async execute(id: string, updates: Partial<User>): Promise<User> {
    if (!id || id.trim() === '') {
      throw new Error('User ID is required');
    }

    // Validación 2: Debe haber al menos un campo a actualizar
    if (Object.keys(updates).length === 0) {
      throw new Error('At least one field must be updated');
    }

    // Validación 3: No se puede actualizar el ID
    if ('id' in updates) {
      throw new Error('User ID cannot be updated');
    }

    // Validación 4: Si se actualiza el nombre, debe ser válido
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim() === '') {
        throw new Error('User name cannot be empty');
      }
      if (updates.name.trim().length < 2) {
        throw new Error('User name must be at least 2 characters long');
      }
    }

    // Delegar al repositorio
    return this.userRepository.updateUser(id, updates);
  }
}
