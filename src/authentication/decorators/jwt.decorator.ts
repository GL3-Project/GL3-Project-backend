import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/authentication/guard/jwt.guard';
import { RoleGuard } from '@/authorization/guard/role.guard';

export const UseJwtAuth = () => UseGuards(JwtAuthGuard, RoleGuard);
