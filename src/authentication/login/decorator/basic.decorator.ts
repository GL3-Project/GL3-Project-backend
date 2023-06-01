import { UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '@auth/login/guard/local.guard';
import { RoleGuard } from '@auth/guard/role.guard';

export const UseBasicAuth = () => UseGuards(LocalAuthGuard, RoleGuard);
