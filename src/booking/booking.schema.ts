import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export enum BookingStatus {
  completed = 'completed',
  in_progress = 'in_progress',
}

export enum BookingKind {
  booking = 'Booking',
  user_booking = 'UserBooking',
  transport_booking = 'TransportBooking',
  workshop_booking = 'WorkshopBooking',
  room_booking = 'RoomBooking',
  user_pass = 'UserPass',
}

export interface IBooking {
  status: BookingStatus;
  price: number;
}

export interface IBookingMethods {
  getPrice(): number;

  complete(): void;

  isCompleted(): boolean;

  isOfKind(type: BookingKind): boolean;

  getKind(): BookingKind;
}

export type BookingModel = Model<
  IBooking,
  Record<string, never>,
  IBookingMethods
>;

export type BookingDocument = InstanceType<BookingModel>;

@Schema({
  timestamps: true,
  discriminatorKey: '__t',
})
export class Booking implements IBooking {
  @Prop({
    type: String,
    enum: BookingStatus,
    required: true,
    default: BookingStatus.in_progress,
  })
  status: BookingStatus;

  @Prop({
    type: Number,
    required: true,
  })
  price: number;

  @Prop({
    type: String,
    enum: BookingKind,
  })
  kind: BookingKind;

  @Prop({
    type: Date,
  })
  _createdAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass<
  IBooking,
  BookingModel
>(Booking);

BookingSchema.method('getPrice', function (): number {
  const self: BookingDocument = this;
  return self.price;
});

BookingSchema.method('complete', function (): void {
  const self: BookingDocument = this;
  if (self.status === BookingStatus.completed)
    throw new BadRequestException('This booking is already paid');
  self.status = BookingStatus.completed;
});

BookingSchema.method('isCompleted', function (): boolean {
  const self: BookingDocument = this;
  return self.status === BookingStatus.completed;
});

BookingSchema.method('isOfKind', function (type: BookingKind): boolean {
  const self: BookingDocument = this;
  // @ts-ignore
  return type === BookingKind.booking ?? self.__t === type;
});

BookingSchema.method('getKind', function (): BookingKind {
  const self: BookingDocument = this;
  // @ts-ignore
  return self.__t;
});
