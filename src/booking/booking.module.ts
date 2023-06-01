import { Module } from '@nestjs/common';
import {
  RoomBooking,
  RoomBookingSchema,
  RoomBookingService,
} from '@booking/room-booking';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '@booking/booking.schema';
import {
  TransportBooking,
  TransportBookingSchema,
  TransportBookingService,
} from '@booking/transport-booking';
import {
  UserBooking,
  UserBookingBuilder,
  UserBookingSchema,
  UserBookingService,
} from '@booking/user-booking';
import {
  WorkshopBooking,
  WorkshopBookingSchema,
  WorkshopBookingService,
} from '@booking/workshop-booking';
import { UserModule } from '@user/user.module';
import { TransportModule } from '@transport/transport.module';
import { ConfigModule } from '@nestjs/config';
import { BookingController } from '@booking/booking.controller';
import { AccommodationModule } from '@accommodation/accommodation.module';
import { WorkshopModule } from '@workshop/workshop.module';
import { MessagingModule } from '@messaging/messaging.module';
import { UserPass, UserPassSchema, UserPassService } from '@booking/user-pass';
import { BookingService } from './booking.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Booking.name,
          schema: BookingSchema,
          discriminators: [
            { name: UserBooking.name, schema: UserBookingSchema },
            { name: TransportBooking.name, schema: TransportBookingSchema },
            { name: WorkshopBooking.name, schema: WorkshopBookingSchema },
            { name: RoomBooking.name, schema: RoomBookingSchema },
            { name: UserPass.name, schema: UserPassSchema },
          ],
        },
      ],
      'default',
    ),
    UserModule,
    AccommodationModule,
    TransportModule,
    WorkshopModule,
    ConfigModule,
    MessagingModule,
  ],
  controllers: [BookingController],
  providers: [
    BookingService,
    RoomBookingService,
    TransportBookingService,
    WorkshopBookingService,
    UserPassService,
    UserBookingService,
    UserBookingBuilder,
  ],
  exports: [
    BookingService,
    RoomBookingService,
    TransportBookingService,
    WorkshopBookingService,
    UserPassService,
    UserBookingService,
  ],
})
export class BookingModule {}
