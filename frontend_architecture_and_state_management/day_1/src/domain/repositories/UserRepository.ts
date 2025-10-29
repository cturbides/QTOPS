import { User } from '../entities/User';

export interface UserRepository {
  /**
   * Obtiene un usuario por su ID
   * @param id - Identificador único del usuario
   * @returns Promise<User> - Usuario encontrado
   * @throws Error si el usuario no existe
   */
  getUser(id: string): Promise<User>;

  /**
   * Obtiene todos los usuarios
   * @returns Promise<User[]> - Lista de todos los usuarios
   */
  getAllUsers(): Promise<User[]>;

  /**
   * Crea un nuevo usuario
   * @param user - Datos del usuario a crear (sin ID)
   * @returns Promise<User> - Usuario creado con ID asignado
   */
  createUser(user: Omit<User, 'id'>): Promise<User>;

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario a actualizar
   * @param updates - Campos a actualizar
   * @returns Promise<User> - Usuario actualizado
   */
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Promise<void>
   */
  deleteUser(id: string): Promise<void>;
}
