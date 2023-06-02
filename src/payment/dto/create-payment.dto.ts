import { IPayment, PaymentMethod } from '@payment/schema/payment.schema';
import { Types } from 'mongoose';
import { IsDate, IsEnum, IsMongoId, MaxDate, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto implements Omit<IPayment, 'treasurer'> {
  @IsMongoId()
  payer: Types.ObjectId;

  @IsMongoId({ each: true })
  bookings: Types.ObjectId[];

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(Date.now() - 30 * 24 * 3600 * 1000))
  @MaxDate(
    new Date(
      new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0),
    ),
  )
  date: Date;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
