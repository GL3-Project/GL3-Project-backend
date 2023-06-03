import { Types } from 'mongoose';
import { IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { RoomTypeDto } from '@accommodation/dto';
import { IRoomBooking } from '@booking/room-booking';
import { IBooking } from '@booking/booking.schema';

export class RoomBookingDto implements Omit<IRoomBooking, keyof IBooking> {
  @IsMongoId()
  hotelId: Types.ObjectId;

  @ValidateNested()
  roomType: RoomTypeDto;

  @IsArray()
  @IsMongoId({ each: true })
  roommates: Types.ObjectId[];
}
