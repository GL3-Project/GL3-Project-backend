import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@auth/login/guard/jwt.guard';
import { RoleGuard } from '@auth/guard/role.guard';

export const UseJwtAuth = () => UseGuards(JwtAuthGuard, RoleGuard);
