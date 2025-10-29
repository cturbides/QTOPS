import { User } from '../../domain/entities/User';
import { UserViewModel, UserListViewModel, ErrorViewModel } from './UserViewModel';

export class UserPresenter {
  /**
   * Convierte un User de dominio a UserViewModel para la UI
   */
  presentUser(user: User): UserViewModel {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      displayName: this.formatDisplayName(user.name),
    };
  }

  /**
   * Convierte una lista de Users a UserListViewModel
   */
  presentUsers(users: User[]): UserListViewModel {
    return {
      users: users.map(user => this.presentUser(user)),
      total: users.length,
      isEmpty: users.length === 0,
    };
  }

  /**
   * Convierte un error a ErrorViewModel
   */
  presentError(error: unknown): ErrorViewModel {
    if (error instanceof Error) {
      return {
        message: this.formatErrorMessage(error.message),
        type: this.classifyError(error.message),
        code: this.extractErrorCode(error),
      };
    }

    return {
      message: 'An unexpected error occurred',
      type: 'unknown',
    };
  }

  /**
   * Métodos privados de formateo
   */
  private formatDisplayName(name: string): string {
    // Capitalizar cada palabra
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private formatErrorMessage(message: string): string {
    if (message.includes('not found')) {
      return 'The requested user could not be found';
    }

    if (message.includes('required')) {
      return 'Please fill in all required fields';
    }

    if (message.includes('Invalid email')) {
      return 'Please enter a valid email address';
    }

    return message;
  }

  private classifyError(message: string): ErrorViewModel['type'] {
    if (message.includes('required') || message.includes('Invalid')) {
      return 'validation';
    }

    if (message.includes('not found')) {
      return 'notFound';
    }

    if (message.includes('HTTP error')) {
      return 'server';
    }

    return 'unknown';
  }

  private extractErrorCode(error: Error): string | undefined {
    // TODO
    return undefined;
  }
}
