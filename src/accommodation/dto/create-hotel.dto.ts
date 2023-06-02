import { Types } from 'mongoose';
import { IsOptional, ValidateNested } from 'class-validator';
import { HotelDto } from '@accommodation/dto/hotel.dto';
import { RoomCollectionDto } from '@accommodation/dto/room-collection.dto';
import { Transform } from 'class-transformer';

export class CreateHotelDto extends HotelDto {
  @IsOptional()
  _id: Types.ObjectId;

  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    for (let i = 0; i < value.length; i++)
      value[i][1] = new RoomCollectionDto(value[i][1]);
    return new Types.Map<RoomCollectionDto>(value);
  })
  rooms: Types.Map<RoomCollectionDto>;
}
