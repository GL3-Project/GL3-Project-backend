import { IRoomCollection } from '@accommodation/schema';
import { Types } from 'mongoose';
import {
  IsArray,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';
import { RoomTypeDto } from '@accommodation/dto';

export class RoomCollectionDto implements IRoomCollection {
  @IsArray()
  @IsMongoId({ each: true })
  bookings: Types.ObjectId[];

  @IsInt()
  @Min(0)
  count: number;

  @ValidateNested()
  type: RoomTypeDto;

  constructor({
    bookings,
    count,
    type,
  }: {
    bookings: Types.ObjectId[];
    count: number;
    type: RoomTypeDto;
  }) {
    this.bookings = bookings;
    this.count = count;
    this.type = new RoomTypeDto(type.name, type.capacity, type.price);
  }
}
