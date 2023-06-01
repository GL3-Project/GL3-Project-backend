import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { UserService } from '@user/user.service';
import { UserBookingBuilder } from '@booking/user-booking/user-booking.builder';
import {
  IUserBooking,
  PopulatedUserBookingDocument,
  UserBooking,
  UserBookingDocument,
  UserBookingModel,
} from '@booking/user-booking/schema/user-booking.schema';
import { RoomBookingDocument, RoomBookingService } from '@booking/room-booking';
import {
  TransportBookingDocument,
  TransportBookingService,
} from '@booking/transport-booking';
import {
  WorkshopBookingDocument,
  WorkshopBookingService,
} from '@booking/workshop-booking';
import { CreateUserBookingDto } from '@booking/user-booking/dto/create-user-booking.dto';
import { UserBookingDto } from '@booking/user-booking/dto/user-booking.dto';
import { ConfigService } from '@nestjs/config';
import { NcscConfig } from '@config/ncsc.config';
import { PopulatedUserDocument, UserDocument } from '@user/schema';
import { MessagingService, Template } from '@messaging/messaging.service';
import { FrontConfig } from '@config';
import { getDeadline } from '@booking/booking.utils';

@Injectable()
export class UserBookingService {
  private readonly logger = new Logger(UserBookingService.name);

  constructor(
    @InjectModel(UserBooking.name, 'default')
    private readonly userBookingModel: UserBookingModel,
    @Inject(forwardRef(() => RoomBookingService))
    private readonly roomBookingService: RoomBookingService,
    @Inject(forwardRef(() => TransportBookingService))
    private readonly transportBookingService: TransportBookingService,
    @Inject(forwardRef(() => WorkshopBookingService))
    private readonly workshopBookingService: WorkshopBookingService,
    private readonly configService: ConfigService,
    private readonly builder: UserBookingBuilder,
    private readonly userService: UserService,
    private readonly messagingService: MessagingService,
  ) {
    UserBooking.price =
      configService.getOrThrow<NcscConfig>('ncsc').pricePool.base;
  }

  async createUserBooking(data: IUserBooking, session?: ClientSession) {
    const booking = new this.userBookingModel(data);
    await booking.save({ session });
    return booking;
  }

  async getUserBooking(bookingId: Types.ObjectId, session?: ClientSession) {
    const booking = await this.userBookingModel
      .findById(bookingId, {}, { session })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  async getUserBookingByUserId(
    userId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const user = await this.userService.getUser(userId, session);

    if (user.booking === undefined)
      throw new BadRequestException('User is not booked in');
    const booking = await this.getUserBooking(user.booking, session);

    // null safety
    if (booking === null)
      throw new BadRequestException('User is not booked in');
    else return booking;
  }

  async getPopulatedUserBooking(
    bookingId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const booking = await this.userBookingModel
      .findById(bookingId, {}, { session })
      .populate<{ roomBooking?: RoomBookingDocument }>({ path: 'roomBooking' })
      .populate<{ transportBooking?: TransportBookingDocument }>({
        path: 'transportBooking',
      })
      .populate<{ workshopBooking?: WorkshopBookingDocument }>({
        path: 'workshopBooking',
      })
      .exec();

    // null safety
    if (booking === null) throw new NotFoundException('Booking not found');
    else return booking;
  }

  async getPopulatedUserBookingByUserId(
    userId: Types.ObjectId,
    session?: ClientSession,
  ) {
    const user = await this.userService.getUser(userId, session);

    if (user.booking === undefined)
      throw new BadRequestException('User is not booked in');
    const booking = await this.getPopulatedUserBooking(user.booking, session);

    // null safety
    if (booking === null)
      throw new BadRequestException('User is not booked in');
    else return booking;
  }

  async addBooking(
    user: PopulatedUserDocument,
    bookingData: CreateUserBookingDto,
    session: ClientSession,
  ): Promise<PopulatedUserBookingDocument> {
    if (user.booking !== undefined)
      throw new BadRequestException('This user is already booked in.');

    await this.builder.initialize(user as UserDocument, session);

    if (bookingData.roomBooking) {
      const { roommates, hotelId, roomType } = bookingData.roomBooking;
      if (roommates.find((r) => r._id.equals(user._id)) === undefined)
        roommates.push(user._id);
      await this.builder.bookRoom(roommates, hotelId, roomType);
    }

    if (bookingData.workshopBooking) {
      const { workshopIds } = bookingData.workshopBooking;
      await this.builder.bookWorkshops(workshopIds);
    }

    if (bookingData.transportBooking) {
      const { transportId } = bookingData.transportBooking;
      await this.builder.bookTransport(transportId);
    }

    const booking = await this.builder.get();

    this.logger.log(`new booking for ${user.email}: ${booking}`);

    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.successful_booking_registration,
      data: {
        first_name: user.firstName,
        room: booking.roomBooking?.roomType.name,
        deadline: getDeadline(
          this.configService.getOrThrow<NcscConfig>('ncsc').payment,
        ),
        link: this.configService.getOrThrow<FrontConfig>('front').routes
          .faq_route,
      },
    });

    return booking;
  }

  async updateBooking(
    user: PopulatedUserDocument,
    bookingData: UserBookingDto,
    session: ClientSession,
  ): Promise<PopulatedUserBookingDocument> {
    const booking = await this.getPopulatedUserBookingByUserId(
      user._id,
      session,
    );
    let changed = false;

    if (bookingData.roomBooking !== undefined) {
      changed = true;
      if (booking.roomBooking === undefined) {
        await this.roomBookingService.createRoomBooking(
          bookingData.roomBooking,
        );
      } else {
        throw new BadRequestException('User already has booked in for a room');
      }
    }

    if (bookingData.workshopBooking !== undefined) {
      changed = true;
      if (booking.workshopBooking !== undefined) {
        await this.workshopBookingService.transfersParticipant(
          user,
          bookingData.workshopBooking.workshopIds,
          session,
        );
      } else {
        await this.workshopBookingService.createWorkshopBookings(
          [bookingData.workshopBooking],
          session,
        );
      }
    }

    if (bookingData.transportBooking !== undefined) {
      changed = true;
      if (booking.transportBooking !== undefined) {
        await this.transportBookingService.transferPassenger(
          user,
          booking.transportBooking.transportId,
          session,
        );
      } else {
        await this.transportBookingService.createTransportBooking(
          bookingData.transportBooking,
        );
      }
    }

    if (!changed) await session.abortTransaction();

    booking.save({ session });
    return booking;
  }

  async removeBooking(
    user: PopulatedUserDocument,
    session: ClientSession,
  ): Promise<void> {
    await this.roomBookingService.removeRoommate(user, session);

    await this.transportBookingService.removeTransportBooking(
      user._id,
      session,
    );

    await this.workshopBookingService.removeWorkshopBooking(user._id, session);

    await this.userBookingModel
      .findByIdAndDelete(user.booking, { session })
      .exec();

    user.booking = undefined;
    await user.save({ session });
  }

  async completeUserBooking(
    userBooking: UserBookingDocument,
    session?: ClientSession,
  ) {
    userBooking.complete();
    await userBooking.save({ session });
  }
}
