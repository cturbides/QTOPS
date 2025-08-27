import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@modules/curso/entities/auth/rol-usuario.enum';
import { USER_PERMISSIONS_METADATA, USER_ROLES_METADATA } from '@modules/curso/graphql/common/secure-metadata.constants';

export const RequireRoles = (...roles: RolUsuario[]) =>
  SetMetadata(USER_ROLES_METADATA, roles);

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(USER_PERMISSIONS_METADATA, permissions);
