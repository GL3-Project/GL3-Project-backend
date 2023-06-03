import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  BookingDocument,
  BookingKind,
  BookingModel,
} from '@booking/booking.schema';
import { ConfigService } from '@nestjs/config';
import { NcscConfig } from '@config/ncsc.config';
import { ClientSession, Connection, FilterQuery, Types } from 'mongoose';
import { PopulatedUserDocument } from '@user/schema';
import { UserPassService } from '@booking/user-pass';
import {
  CreateUserBookingDto,
  PopulatedUserBookingDocument,
  UserBookingDocument,
  UserBookingDto,
  UserBookingService,
} from '@booking/user-booking';
import { RoomBookingService } from '@booking/room-booking';
import { TransportBookingService } from '@booking/transport-booking';
import { WorkshopBookingService } from '@booking/workshop-booking';
import { UserService } from '@user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isPastDeadline } from '@booking/booking.utils';

@Injectable()
export class BookingService {
  private readonly paymentInterval: number;
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel('Booking', 'default')
    private readonly bookingModel: BookingModel,
    private readonly userPassService: UserPassService,
    private readonly userBookingService: UserBookingService,
    private readonly roomBookingService: RoomBookingService,
    private readonly transportBookingService: TransportBookingService,
    private readonly workshopBookingService: WorkshopBookingService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {
    this.paymentInterval =
      this.configService.getOrThrow<NcscConfig>('insat').payment;
  }

  async getAllBookings(session?: ClientSession) {
    await this.bookingModel.updateMany(
      { __t: 'UserBooking', price: 70 },
      { price: 0 },
      { session },
    );
    return this.bookingModel.find({}, {}, { session });
  }

  async getBooking(
    bookingId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findById(bookingId, {}, { session })
      .exec();

    // null safety
    if (booking === null)
      throw new NotFoundException('This booking was not found');
    else return booking;
  }

  async getBookingByUser(
    user: PopulatedUserDocument,
    session?: ClientSession,
  ): Promise<PopulatedUserBookingDocument> {
    if (!user.booking) {
      throw new BadRequestException('This user did not book yet');
    }

    if (user.booking.isOfKind(BookingKind.user_pass)) {
      return await this.userPassService.getUserPass(user.booking._id, session);
    } else {
      return await this.userBookingService.getPopulatedUserBooking(
        user.booking._id,
        session,
      );
    }
  }

  async findBooking(
    conditions: FilterQuery<BookingDocument>,
    session?: ClientSession,
  ) {
    const booking = await this.bookingModel
      .findOne(conditions, {}, { session })
      .exec();

    // null safety
    if (booking === null)
      throw new NotFoundException('This booking was not found');
    else return booking;
  }

  async findAllBookings(
    conditions: FilterQuery<BookingDocument>,
    session?: ClientSession,
  ) {
    return this.bookingModel.find(conditions, {}, { session }).exec();
  }

  async addBooking(
    user: PopulatedUserDocument,
    bookingData: CreateUserBookingDto,
    session: ClientSession,
  ) {
    if (
      !bookingData.roomBooking &&
      !bookingData.workshopBooking &&
      !bookingData.transportBooking
    ) {
      return await this.userPassService.addPass(user, session);
    } else if (bookingData.roomBooking) {
      return await this.userBookingService.addBooking(
        user,
        bookingData,
        session,
      );
    } else {
      throw new BadRequestException('Accommodation is necessary');
    }
  }

  async updateBooking(
    user: PopulatedUserDocument,
    bookingData: UserBookingDto,
    session: ClientSession,
  ) {
    if (user.booking!.isCompleted()) {
      throw new BadRequestException('This user has already paid his booking');
    }

    return await this.userBookingService.updateBooking(
      user,
      bookingData,
      session,
    );
  }

  async cancelBooking(user: PopulatedUserDocument, session: ClientSession) {
    if (user.booking!.isCompleted()) {
      throw new BadRequestException('This user has already paid his booking');
    }

    if (user.booking!.isOfKind(BookingKind.user_booking)) {
      await this.userBookingService.removeBooking(user, session);
    } else {
      await this.userPassService.removeUserPass(user, session);
    }
  }

  async restoreBookings(users: string[], session: ClientSession) {
    const userDocs = await this.userService.findAllUsers(
      { email: { $in: users } },
      {},
      session,
    );

    if (userDocs.length !== users.length)
      throw new NotFoundException('Some of the users were not found');

    const bookings = await this.findAllBookings(
      {
        __t: { $in: [BookingKind.user_booking, BookingKind.user_pass] },
      },
      session,
    ).then((bookings) =>
      bookings.filter((booking) =>
        userDocs.find((user) =>
          user._id.equals((booking as UserBookingDocument).userId),
        ),
      ),
    );

    bookings.forEach((booking) => {
      const user = userDocs.find((user) =>
        user._id.equals((booking as UserBookingDocument).userId),
      );

      if (user === undefined)
        throw new NotFoundException('Some of the users were not found');

      if (user.booking !== undefined)
        this.logger.log(
          `${user.firstName} ${user.lastName} (${user.email}) already has a booking: ${user.booking}`,
        );

      user.booking = booking._id;
    });

    await Promise.all(userDocs.map((user) => user.save({ session })));
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cron() {
    const session = await this.connection.startSession();
    await session.withTransaction(async (session) => {
      const users = await this.userService.getAllPopulatedUsers(session);
      let deleted = 0;
      for (const user of users) {
        if (
          user.booking !== undefined &&
          !user.booking.isCompleted() &&
          // @ts-ignore
          isPastDeadline(this.paymentInterval, user.booking.createdAt)
        ) {
          // soft delete
          user.booking = undefined;
          await user.save({ session });
          deleted++;
        }
      }
      this.logger.log(`Cron Job Finished. Deleted ${deleted}`);
    });
  }
}
