import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Invitation,
  InvitationModel,
  PopulatedInvitationDocument,
} from '@request/invitation/schema/invitation.schema';
import { RoomBookingDocument, RoomBookingService } from '@booking/room-booking';
import { MessagingService, Template } from '@messaging/messaging.service';
import { CreateInvitationDto } from '@request/invitation/dto/create-invitation.dto';
import { UserService } from '@user/user.service';
import { ClientSession, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FrontConfig } from '@config';
import { RequestState } from '@request/request.schema';
import { PopulatedUserDocument } from '@user/schema';
import { UserBookingService } from '@booking/user-booking';
import { BookingKind, BookingStatus } from '@booking/booking.schema';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    @InjectModel(Invitation.name, 'default')
    private readonly invitationModel: InvitationModel,
    private readonly userBookingService: UserBookingService,
    private readonly roomBookingService: RoomBookingService,
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async getSentInvitations(
    user: PopulatedUserDocument,
    session?: ClientSession,
  ): Promise<PopulatedInvitationDocument[]> {
    return await this.invitationModel
      .find(
        { host: user._id, state: RequestState.in_progress },
        {},
        { session },
      )
      .populate<{ room: RoomBookingDocument }>({
        path: 'room',
        populate: { path: 'roommates' },
      })
      .populate<{ host: PopulatedUserDocument }>({
        path: 'host',
        select: '_id firstName lastName',
      })
      .populate<{ invited: PopulatedUserDocument }>({
        path: 'invited',
        select: '_id firstName lastName',
      })
      .exec();
  }

  async getRecievedInvitations(
    user: PopulatedUserDocument,
    session?: ClientSession,
  ): Promise<PopulatedInvitationDocument[]> {
    return await this.invitationModel
      .find(
        { invited: user._id, state: RequestState.in_progress },
        {},
        { session },
      )
      .populate<{ room: RoomBookingDocument }>({
        path: 'room',
        populate: { path: 'roommates' },
      })
      .populate<{ host: PopulatedUserDocument }>({
        path: 'host',
        select: '_id firstName lastName',
      })
      .populate<{ invited: PopulatedUserDocument }>({
        path: 'invited',
        select: '_id firstName lastName',
      })
      .exec();
  }

  async getInvitation(
    id: Types.ObjectId,
    session?: ClientSession,
  ): Promise<PopulatedInvitationDocument> {
    const invitation = await this.invitationModel
      .findById(id, {}, { session })
      .populate<{ room: RoomBookingDocument }>({
        path: 'room',
        populate: { path: 'roommates' },
      })
      .populate<{ host: PopulatedUserDocument }>({
        path: 'host',
        select: '_id firstName lastName',
      })
      .populate<{ invited: PopulatedUserDocument }>({
        path: 'invited',
        select: '_id firstName lastName',
      })
      .exec();

    if (invitation === null)
      throw new BadRequestException('This invitation does not exist');
    else return invitation;
  }

  async checkExistingInvitation(
    invited: PopulatedUserDocument,
    host: PopulatedUserDocument,
  ) {
    const existingInv = await this.invitationModel.findOne({
      invited: invited._id,
      state: RequestState.in_progress,
      host: host._id,
    });
    return !!existingInv;
  }

  async sendInvitation(
    invitationData: CreateInvitationDto,
    host: PopulatedUserDocument,
    session: ClientSession,
  ) {
    if (host.booking === undefined)
      throw new BadRequestException('User is not booked in yet');

    if (host.booking.roomBooking === undefined)
      throw new BadRequestException('User did not book in for a room');

    const invited = await this.userService.findPopulatedUser(
      {
        email: invitationData.invited,
      },
      session,
    );

    if (invited.booking)
      throw new BadRequestException(
        'The person you are inviting is already in another room',
      );

    if (host._id.equals(invited._id))
      throw new BadRequestException('Invalid target.');

    if (await this.checkExistingInvitation(invited, host))
      throw new BadRequestException('Already sent a request');

    const room = await this.roomBookingService.getRoomBooking(
      invitationData.room,
      session,
    );

    await this.invitationModel.create(
      [
        {
          room: room._id,
          invited: invited._id,
          state: RequestState.in_progress,
          host: host._id,
        },
      ],
      {
        session,
      },
    );

    const link =
      this.configService.getOrThrow<FrontConfig>('front').routes.login_route;

    this.logger.log(`new invitation from ${host.email} to ${invited.email}`);

    await this.messagingService.sendEmail({
      to: {
        address: invited.email,
        name: invited.firstName,
      },
      template: Template.invitation,
      data: {
        invited: invited.firstName,
        link: link,
        host: `${host.firstName} ${host.lastName}`,
      },
    });
  }

  async acceptInvitation(
    user: PopulatedUserDocument,
    invitation: PopulatedInvitationDocument,
    session: ClientSession,
  ) {
    if (user.booking)
      throw new BadRequestException('User already booked a room.');

    try {
      invitation.room.addRoommate(user._id);
      // there is a slot left in the room
      invitation.complete();
      await invitation.room.save({ session });
      await invitation.save({ session });

      const hostBooking = await this.userBookingService.getUserBookingByUserId(
        invitation.host._id,
        session,
      );
      user.booking = await this.userBookingService.createUserBooking(
        {
          userId: user._id,
          price: hostBooking.price,
          status: BookingStatus.in_progress,
          roomBooking: hostBooking.roomBooking,
        },
        session,
      );
      await user.save({ session });

      return invitation;
    } catch {
      // room is full
      invitation.reject();
      await invitation.save({ session });
      throw new BadRequestException(
        'The room you want to join is already full',
      );
    }
  }

  async rejectInvitation(
    invitation: PopulatedInvitationDocument,
    session?: ClientSession,
  ) {
    invitation.reject();
    await invitation.save({ session });
    return invitation;
  }

  async cancelInvitation(
    invitation: PopulatedInvitationDocument,
    session?: ClientSession,
  ) {
    invitation.cancel();
    await invitation.save({ session });
    return invitation;
  }
}
