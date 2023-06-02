import { SetMetadata, UseGuards } from '@nestjs/common';
import { InvitationGuard } from '@request/invitation/guard/invitation.guard';
import { JwtAuthGuard } from '@auth/login/guard/jwt.guard';
import { RoleGuard } from '@auth/guard/role.guard';

export const INVITATION_KEY = 'invitation';
export const InvitedOnly = () => SetMetadata(INVITATION_KEY, 'invited');
export const HostOnly = () => SetMetadata(INVITATION_KEY, 'host');
export const UseInvitationGuard = () =>
  UseGuards(JwtAuthGuard, RoleGuard, InvitationGuard);
