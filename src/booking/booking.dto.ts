import { IsEnum, IsInt, IsMongoId, Min } from 'class-validator';
import { BookingStatus, IBooking } from '@booking/booking.schema';
import { Types } from 'mongoose';

export class BookingDto implements IBooking {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsInt()
  @Min(0)
  price: number;

  @IsMongoId()
  userId: Types.ObjectId;
}
