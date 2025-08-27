export interface UsuarioAutenticado {
  id: string;
  email: string;
  roles: string[];
  activo: boolean;
  sesionId?: string;
  permisos: string[];
}
