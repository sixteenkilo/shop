import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Коды ролей из БД (см. seed: ADMIN, USER). */
export const RoleCode = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
