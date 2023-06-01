import { UseGuards } from '@nestjs/common';
import { RoleGuard } from '@/authorization/guard/role.guard';
import { MagicLinkAuthGuard } from '@authentication/guard/magic-link.guard';

export const UseMagicLinkAuth = () => UseGuards(MagicLinkAuthGuard, RoleGuard);
