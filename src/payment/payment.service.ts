import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentModel,
  PopulatedPaymentDocument,
} from '@payment/schema/payment.schema';
import { CreatePaymentDto } from '@payment/dto/create-payment.dto';
import { ClientSession } from 'mongoose';
import { PopulatedUserDocument } from '@user/schema';
import { UserBookingDocument, UserBookingService } from '@booking/user-booking';
import { UserService } from '@user/user.service';
import { BookingDocument, BookingKind } from '@booking/booking.schema';
import { RoomBookingDocument, RoomBookingService } from '@booking/room-booking';
import { UserPassDocument, UserPassService } from '@booking/user-pass';
import {
  TransportBookingDocument,
  TransportBookingService,
} from '@booking/transport-booking';
import {
  WorkshopBookingDocument,
  WorkshopBookingService,
} from '@booking/workshop-booking';
import { BookingService } from '@booking/booking.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name, 'default') private paymentModel: PaymentModel,
    private readonly bookingService: BookingService,
    private readonly userPassService: UserPassService,
    private readonly userBookingService: UserBookingService,
    private readonly roomBookingService: RoomBookingService,
    private readonly transportBookingService: TransportBookingService,
    private readonly workshopBookingService: WorkshopBookingService,
    private readonly userService: UserService,
  ) {}

  async getAllPayments(session?: ClientSession): Promise<PaymentDocument[]> {
    return this.paymentModel.find({}, {}, { session }).exec();
  }

  async getAllPopulatedPayments(
    session?: ClientSession,
  ): Promise<PopulatedPaymentDocument[]> {
    return this.paymentModel
      .find({}, {}, { session })
      .populate<{ bookings: BookingDocument[] }>({ path: 'bookings' })
      .exec();
  }

  async createPayments(
    payments: CreatePaymentDto[],
    treasurer: PopulatedUserDocument,
    session?: ClientSession,
  ) {
    return await this.paymentModel.create(
      payments.map((payment) => ({ ...payment, treasurer: treasurer._id })),
      { session },
    );
  }

  async pay(
    payment: CreatePaymentDto,
    treasurer: PopulatedUserDocument,
    session: ClientSession,
  ) {
    if ((await this.userService.getUser(payment.payer, session)) === undefined)
      throw new NotFoundException('This payer was not found');

    if (payment.bookings.length === 0)
      throw new BadRequestException('No bookings were provided');

    // calculate the occurrence of each booking
    const bookingIdsMap = new Map<string, number>();

    for (const booking of payment.bookings) {
      const occurrence = bookingIdsMap.get(booking.toString()) ?? 0;
      bookingIdsMap.set(booking.toString(), occurrence + 1);
    }

    // get all bookings of payment (mongodb ensures no duplicates after querying although that does not affect this code)
    const bookings = await this.bookingService.findAllBookings({
      _id: { $in: payment.bookings },
    });

    // replace the map of booking ids with a map of bookings
    const bookingsMap = new Map<BookingDocument, number>();

    for (const booking of bookings) {
      const occurrence = bookingIdsMap.get(booking._id.toString());
      if (occurrence === undefined)
        throw new NotFoundException('Some of the bookings were not found');
      else bookingsMap.set(booking, occurrence);
    }

    if (bookingsMap.size !== bookingIdsMap.size)
      throw new NotFoundException('Some of the bookings were not found');

    for (const [booking, occurrence] of bookingsMap) {
      const bookingType = booking.getKind();
      switch (bookingType) {
        case BookingKind.user_pass:
          await this.userPassService.completeUserPass(
            booking as UserPassDocument,
            session,
          );
          break;
        case BookingKind.user_booking:
          await this.userBookingService.completeUserBooking(
            booking as UserBookingDocument,
            session,
          );
          break;
        case BookingKind.room_booking:
          const numberOfPastPayments = await this.paymentModel
            .aggregate([
              { $unwind: '$bookings' },
              {
                $group: {
                  _id: { booking: '$bookings' },
                  count: { $sum: 1 },
                },
              },
              {
                $match: { _id: { booking: booking._id } },
              },
            ])
            .exec()
            .then((data) => data[0]?.count ?? 0);
          if (
            numberOfPastPayments + occurrence ===
            (booking as RoomBookingDocument).roomType.capacity
          ) {
            await this.roomBookingService.completeRoomBooking(
              booking as RoomBookingDocument,
              session,
            );
          }
          break;
        case BookingKind.transport_booking:
          await this.transportBookingService.completeTransportBooking(
            booking as TransportBookingDocument,
            session,
          );
          break;
        case BookingKind.workshop_booking:
          await this.workshopBookingService.completeWorkshopBooking(
            booking as WorkshopBookingDocument,
            session,
          );
          break;
        default:
          throw new InternalServerErrorException(
            'Could not identify the booking',
          );
      }
    }

    return await this.createPayments([payment], treasurer, session).then(
      (payments) => payments[0],
    );
  }

  async payMany(
    payments: CreatePaymentDto[],
    treasurer: PopulatedUserDocument,
    session: ClientSession,
  ) {
    const users = await this.userService.getAllPopulatedUsers(session);
    const bookings: BookingDocument[] =
      await this.bookingService.getAllBookings(session);

    const errors: CreatePaymentDto[] = [];

    const validatedPayments: CreatePaymentDto[] = [];

    for (const payment of payments) {
      if (users.find((user) => user._id.equals(payment.payer)) === undefined) {
        errors.push(payment);
      } else {
        const initialErrors = errors.length;
        for (const bookingId of payment.bookings) {
          const booking = bookings.find((booking) =>
            booking._id.equals(bookingId),
          );

          if (booking === undefined) {
            errors.push(payment);
          } else {
            const bookingType = booking.getKind();
            switch (bookingType) {
              case BookingKind.user_pass:
                try {
                  await this.userPassService.completeUserPass(
                    booking as UserPassDocument,
                    session,
                  );
                } catch {
                  errors.push(payment);
                }
                break;
              case BookingKind.user_booking:
                try {
                  await this.userBookingService.completeUserBooking(
                    booking as UserBookingDocument,
                    session,
                  );
                } catch {
                  errors.push(payment);
                }
                break;
              case BookingKind.room_booking:
                try {
                  if (
                    (await this.paymentModel
                      .aggregate([
                        { $unwind: '$bookings' },
                        {
                          $group: {
                            _id: { booking: '$bookings' },
                            count: { $sum: 1 },
                          },
                        },
                        {
                          $match: { _id: { booking: booking._id } },
                        },
                      ])
                      .exec()
                      .then((data) => data[0].count)) +
                      1 ===
                    (booking as RoomBookingDocument).roomType.capacity
                  )
                    await this.roomBookingService.completeRoomBooking(
                      booking as RoomBookingDocument,
                      session,
                    );
                } catch {
                  errors.push(payment);
                }
                break;
              case BookingKind.transport_booking:
                try {
                  await this.transportBookingService.completeTransportBooking(
                    booking as TransportBookingDocument,
                    session,
                  );
                } catch {
                  errors.push(payment);
                }
                break;
              case BookingKind.workshop_booking:
                try {
                  await this.workshopBookingService.completeWorkshopBooking(
                    booking as WorkshopBookingDocument,
                    session,
                  );
                } catch {
                  errors.push(payment);
                }
                break;
              default:
                throw new InternalServerErrorException(
                  'Could not identify the booking',
                );
            }
          }
        }
        if (errors.length === initialErrors) validatedPayments.push(payment);
      }
    }

    await this.createPayments(validatedPayments, treasurer, session);

    return { errors, validatedPayments };
  }
}
