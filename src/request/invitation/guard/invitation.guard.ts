import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { INVITATION_KEY } from '@request/invitation/decorator/invitation.decorator';
import { IInvitation } from '@request/invitation/schema/invitation.schema';
import { InvitationService } from '@request/invitation/invitation.service';

@Injectable()
export class InvitationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly invitationService: InvitationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<
      keyof Pick<IInvitation, 'invited' | 'host'>
    >(INVITATION_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const { invitationId } = request.body;
    const { user } = request;

    if (invitationId !== undefined) {
      const invitation = await this.invitationService.getInvitation(
        invitationId,
      );
      request.invitation = invitation;

      return !requiredRole || invitation[requiredRole].equals(user._id);
    } else {
      return !requiredRole;
    }
  }
}
