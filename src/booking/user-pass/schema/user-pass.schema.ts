import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Booking,
  BookingKind,
  IBooking,
  IBookingMethods,
} from '@booking/booking.schema';

export interface IUserPass extends IBooking {
  userId: Types.ObjectId;
}

export type IUserPassMethods = IBookingMethods;

export type UserPassModel = Model<
  IUserPass,
  Record<string, never>,
  IUserPassMethods
>;

export type UserPassDocument = InstanceType<UserPassModel>;

@Schema({
  timestamps: true,
})
export class UserPass extends Booking implements IUserPass {
  static price: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;
}

export const UserPassSchema = SchemaFactory.createForClass<
  IUserPass,
  UserPassModel
>(UserPass);

UserPassSchema.method('getPrice', function (): number {
  return UserPass.price;
});
