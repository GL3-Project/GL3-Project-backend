import { UseGuards } from '@nestjs/common';
import { JwtRefreshGuard } from '@auth/refresh/guard/jwt.guard';
import { RoleGuard } from '@auth/guard/role.guard';

export const UseJwtRefresh = () => UseGuards(JwtRefreshGuard, RoleGuard);
