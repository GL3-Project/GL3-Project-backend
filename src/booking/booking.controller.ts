import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from '@auth/decorator/role.decorator';
import { PopulatedUserDocument, UserRole } from '@user/schema';
import { Connection } from 'mongoose';
import {
  CreateUserBookingDto,
  PopulatedUserBookingDocument,
  UserBookingDto,
} from '@booking/user-booking';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { InjectConnection } from '@nestjs/mongoose';
import { BookingInterceptor } from '@booking/booking.interceptor';
import { Throttle } from '@nestjs/throttler';
import { BookingService } from '@booking/booking.service';
import { RestoreBookingDto } from '@booking/restore-booking.dto';

@Controller('book')
@UseJwtAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Get()
  @Throttle(100, 60)
  @Role(UserRole.participant)
  @UseInterceptors(BookingInterceptor)
  async get(
    @Req() { user }: { user: PopulatedUserDocument },
  ): Promise<PopulatedUserBookingDocument | undefined> {
    try {
      return await this.bookingService.getBookingByUser(user);
    } catch {
      return undefined;
    }
  }

  @Post()
  @Role(UserRole.participant)
  async book(
    @Req() { user }: { user: PopulatedUserDocument },
    @Body() bookingData: CreateUserBookingDto,
  ): Promise<PopulatedUserBookingDocument> {
    const session = await this.connection.startSession();

    let booking;
    await session.withTransaction(async (session) => {
      booking = await this.bookingService.addBooking(
        user,
        bookingData,
        session,
      );
    });
    return booking;
  }

  @Patch()
  @Role(UserRole.participant)
  async update(
    @Req() { user }: { user: PopulatedUserDocument },
    @Body() bookingData: UserBookingDto,
  ): Promise<PopulatedUserBookingDocument> {
    const session = await this.connection.startSession();
    let booking;
    await session.withTransaction(async (session) => {
      booking = await this.bookingService.updateBooking(
        user,
        bookingData,
        session,
      );
    });
    return booking;
  }

  @Delete('cancel')
  @Role(UserRole.participant)
  async cancel(@Req() { user }: { user: PopulatedUserDocument }) {
    if (user.booking) {
      const session = await this.connection.startSession();
      await session.withTransaction(async (session) => {
        await this.bookingService.cancelBooking(user, session);
      });
    } else {
      throw new BadRequestException('User is not booked in');
    }
  }

  @Post('restore')
  @Role(UserRole.admin)
  async restore(@Body() { users }: RestoreBookingDto) {
    const session = await this.connection.startSession();
    let result;
    await session.withTransaction(async (session) => {
      result = await this.bookingService.restoreBookings(users, session);
    });
    return result;
  }
}
