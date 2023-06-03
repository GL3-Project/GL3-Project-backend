import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Booking, IBooking, IBookingMethods } from '@booking/booking.schema';

export interface ITransportBooking extends IBooking {
  userId: Types.ObjectId;
  transportId: Types.ObjectId;
}

export type ITransportBookingMethods = IBookingMethods;

export type TransportBookingModel = Model<
  ITransportBooking,
  Record<string, never>,
  ITransportBookingMethods
>;

export type TransportBookingDocument = InstanceType<TransportBookingModel>;

@Schema({
  timestamps: true,
})
export class TransportBooking extends Booking implements ITransportBooking {
  @Prop({
    type: Types.ObjectId,
    ref: 'Transport',
    required: true,
  })
  transportId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;
}

export const TransportBookingSchema = SchemaFactory.createForClass<
  ITransportBooking,
  TransportBookingModel
>(TransportBooking);
