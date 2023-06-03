import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingDocument } from '@booking/booking.schema';

export enum PaymentMethod {
  cash = 'cash',
  d17 = 'D17',
}

export interface IPayment {
  treasurer: Types.ObjectId;
  payer: Types.ObjectId;
  bookings: Types.ObjectId[];
  date: Date;
  method: PaymentMethod;
}

export interface IPaymentMethods {}

export type PaymentModel = Model<
  IPayment,
  Record<string, never>,
  IPaymentMethods
>;

export type PaymentDocument = InstanceType<PaymentModel>;

export type PopulatedPaymentDocument = Omit<Payment, 'bookings'> & {
  bookings: BookingDocument[];
};

@Schema({
  timestamps: true,
})
export class Payment implements IPayment {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  treasurer: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  payer: Types.ObjectId;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'Booking',
        required: true,
      },
    ],
    required: true,
  })
  bookings: Types.ObjectId[];

  @Prop({
    type: Date,
    max: new Date(
      new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0),
    ),
    min: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    required: true,
  })
  date: Date;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
  })
  method: PaymentMethod;
}

export const PaymentSchema = SchemaFactory.createForClass<
  IPayment,
  PaymentModel
>(Payment);
