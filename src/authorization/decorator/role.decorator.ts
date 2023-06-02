import { UserRole } from '@user/schema';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';
export const Role = (role: UserRole) => SetMetadata(ROLES_KEY, role);
