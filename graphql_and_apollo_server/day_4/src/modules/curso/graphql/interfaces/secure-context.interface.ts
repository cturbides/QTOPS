import { UsuarioAutenticado } from '@modules/curso/entities/auth/usuario-autenticado.interface';
import { CursoDataLoader, LeccionDataLoader, ProgresoDataLoader, UsuarioDataLoader } from '@modules/curso/dataloaders/types/curso.dataloader.types';

export interface SecureGraphQLContext {
  req: any;
  rateLimitInfo?: any;
  isAuthenticated: boolean;
  usuario: UsuarioAutenticado | null;
  requireAuth: () => UsuarioAutenticado;
  loaders: {
    curso: CursoDataLoader;
    usuario: UsuarioDataLoader;
    leccion: LeccionDataLoader;
    progreso: ProgresoDataLoader;
  };
}
