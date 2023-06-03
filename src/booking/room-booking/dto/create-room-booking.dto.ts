import { Types } from 'mongoose';
import { IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { RoomTypeDto } from '@accommodation/dto';
import { IRoomBooking } from '@booking/room-booking';
import { IBooking } from '@booking/booking.schema';
import { Type } from 'class-transformer';

export class CreateRoomBookingDto
  implements Omit<IRoomBooking, keyof IBooking>
{
  @IsMongoId()
  hotelId: Types.ObjectId;

  @ValidateNested()
  @Type(() => RoomTypeDto)
  roomType: RoomTypeDto;

  @IsArray()
  @IsMongoId({ each: true })
  roommates: Types.ObjectId[];

  constructor(
    hotelId: Types.ObjectId,
    roomType: RoomTypeDto,
    roommates: Types.ObjectId[],
  ) {
    this.hotelId = hotelId;
    this.roomType = roomType;
    this.roommates = roommates;
  }
}
