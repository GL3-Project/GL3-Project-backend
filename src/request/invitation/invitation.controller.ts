import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { InvitationService } from '@request/invitation/invitation.service';
import { PopulatedUserDocument, UserRole } from '@user/schema';
import { Role } from '@auth/decorator/role.decorator';
import { CreateInvitationDto } from '@request/invitation/dto/create-invitation.dto';
import {
  HostOnly,
  InvitedOnly,
  UseInvitationGuard,
} from '@request/invitation/decorator/invitation.decorator';
import { PopulatedInvitationDocument } from '@request/invitation/schema/invitation.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Throttle } from '@nestjs/throttler';

@Controller('invitation')
@UseInvitationGuard()
@Role(UserRole.participant)
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Get('recieved')
  @Throttle(100, 60)
  async getRecievedInvitations(
    @Req() { user }: { user: PopulatedUserDocument },
  ): Promise<PopulatedInvitationDocument[]> {
    return await this.invitationService.getRecievedInvitations(user);
  }

  @Get('sent')
  @Throttle(30, 60)
  async getSentInvitations(
    @Req() { user }: { user: PopulatedUserDocument },
  ): Promise<PopulatedInvitationDocument[]> {
    return await this.invitationService.getSentInvitations(user);
  }

  @Post('send')
  async sendInvitation(
    @Req() { user }: { user: PopulatedUserDocument },
    @Body() invitationData: CreateInvitationDto,
  ) {
    const session = await this.connection.startSession();
    let invite;
    await session.withTransaction(async (session) => {
      invite = await this.invitationService.sendInvitation(
        invitationData,
        user,
        session,
      );
      return invite;
    });
    return invite;
  }

  @Patch('accept')
  @InvitedOnly()
  async acceptInvitation(
    @Req()
    {
      invitation,
      user,
    }: {
      invitation: PopulatedInvitationDocument;
      user: PopulatedUserDocument;
    },
  ) {
    const session = await this.connection.startSession();
    let invite;
    await session.withTransaction(async (session) => {
      invite = await this.invitationService.acceptInvitation(
        user,
        invitation,
        session,
      );
      return invite;
    });
    return invite;
  }

  @Patch('reject')
  @InvitedOnly()
  async rejectInvitation(
    @Req()
    { invitation }: { invitation: PopulatedInvitationDocument },
  ) {
    const session = await this.connection.startSession();
    let invite;
    await session.withTransaction(async (session) => {
      invite = await this.invitationService.rejectInvitation(
        invitation,
        session,
      );
      return invite;
    });
    return invite;
  }

  @Patch('cancel')
  @HostOnly()
  async cancelInvitation(
    @Req()
    { invitation }: { invitation: PopulatedInvitationDocument },
  ) {
    return await this.invitationService.cancelInvitation(invitation);
  }
}
