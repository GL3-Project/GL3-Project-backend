import { UserRole } from '@/user/intefaces/user.interface';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';
export const Role = (role: UserRole) => SetMetadata(ROLES_KEY, role);
