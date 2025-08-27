import { RolUsuario } from './auth/rol-usuario.enum';

export type Usuario = {
  id: string;
  email?: string;
  activo?: boolean;
  roles?: RolUsuario[];
  nombreCompleto: string;
  avatar?: string | null;
};
