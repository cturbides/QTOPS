import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Ejecuta el caso de uso
   * @returns Promise<User[]> - Lista de todos los usuarios
   */
  async execute(): Promise<User[]> {
    return this.userRepository.getAllUsers();
  }
}
