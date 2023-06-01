import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { Booking, IBooking, IBookingMethods } from '@booking/booking.schema';
import { WorkshopBookingDocument } from '@booking/workshop-booking';
import {
  PopulatedRoomBookingDocument,
  RoomBookingDocument,
} from '@booking/room-booking';
import { TransportBookingDocument } from '@booking/transport-booking';

export interface IUserBooking extends IBooking {
  userId: Types.ObjectId;
  transportBooking?: Types.ObjectId;
  workshopBooking?: Types.ObjectId;
  roomBooking?: Types.ObjectId;
}

export type IUserBookingMethods = IBookingMethods;

export type UserBookingModel = Model<
  IUserBooking,
  Record<string, never>,
  IUserBookingMethods
>;

export type UserBookingDocument = InstanceType<UserBookingModel>;

export type PopulatedUserBookingDocument = Omit<
  UserBookingDocument,
  'workshopBooking' | 'roomBooking' | 'transportBooking'
> & {
  workshopBooking?: WorkshopBookingDocument;
  roomBooking?: RoomBookingDocument | PopulatedRoomBookingDocument;
  transportBooking?: TransportBookingDocument;
};

@Schema({
  timestamps: true,
})
export class UserBooking extends Booking implements IUserBooking {
  static price: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'RoomBooking',
  })
  roomBooking?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'TransportBooking',
  })
  transportBooking?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'WorkshopBooking',
  })
  workshopBooking?: Types.ObjectId;
}

export const UserBookingSchema = SchemaFactory.createForClass<
  IUserBooking,
  UserBookingModel
>(UserBooking);

UserBookingSchema.method('getPrice', function (): number {
  type Bookings = keyof Omit<IUserBooking, 'userId' | keyof IBooking>;
  const self: Omit<UserBookingDocument, Bookings> | Types.ObjectId | undefined =
    this;
  if (self === undefined || self instanceof Types.ObjectId)
    throw new InternalServerErrorException();

  const keys = Object.keys(UserBooking) as Array<keyof IUserBooking>;

  return keys.reduce(
    (prev, curr) =>
      prev + (self[curr].getPrice !== undefined ? self[curr].getPrice() : 0),
    self.price,
  );
});
