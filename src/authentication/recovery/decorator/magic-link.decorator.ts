import { UseGuards } from '@nestjs/common';
import { MagicLinkAuthGuard } from '@auth/recovery/guard/magic-link.guard';
import { RoleGuard } from '@auth/guard/role.guard';

export const UseMagicLinkAuth = () => UseGuards(MagicLinkAuthGuard, RoleGuard);
