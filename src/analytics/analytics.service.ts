import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { BookingService } from '@booking/booking.service';
import { PaymentService } from '@payment/payment.service';
import { ClientSession } from 'mongoose';
import { BookingKind } from '@booking/booking.schema';
import { AccommodationService } from '@accommodation/accommodation.service';
import { RoomBookingDocument } from '@booking/room-booking';
import { IRoomCollection } from '@accommodation/schema';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly userService: UserService,
    private readonly accommodationService: AccommodationService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
  ) {}

  async getUsersMetrics(session: ClientSession) {
    const users = await this.userService.getAllUsers(session);

    return {
      all: users.length,
      booked_in: users.reduce(
        (prev, curr) => prev + (curr.booking !== undefined ? 1 : 0),
        0,
      ),
      not_booked_in: users.reduce(
        (prev, curr) => prev + (curr.booking === undefined ? 1 : 0),
        0,
      ),
    };
  }

  async getBookingsMetrics(session: ClientSession) {
    const hotels = await this.accommodationService.getAllHotels(session);
    const bookings = await this.bookingService.getAllBookings(session);

    return {
      room_bookings: hotels.map((hotel) => ({
        hotel: hotel.name,
        // @ts-ignore
        rooms: Object.entries<IRoomCollection>(hotel.rooms).reduce<{
          [key: string]: { all: number; paid: number; not_paid: number };
        }>((prev, [roomType, value]) => {
          const all = bookings.filter(
            (booking) =>
              booking.isOfKind(BookingKind.room_booking) &&
              hotel._id.equals((booking as RoomBookingDocument).hotelId),
          ).length;
          return {
            ...prev,
            [roomType]: {
              all,
              paid: value.bookings.length,
              not_paid: all - value.bookings.length,
            },
          };
        }, {}),
      })),
    };
  }

  async getPaymentsMetrics(session: ClientSession) {
    const payments = await this.paymentService.getAllPopulatedPayments(session);

    return {
      all: payments.length,
      total_income: payments
        .map((payment) => payment.bookings.map((booking) => booking.getPrice()))
        .flat()
        .reduce((prev, booking) => prev + booking, 0),
    };
  }
}
