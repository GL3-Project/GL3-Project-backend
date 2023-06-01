import { HotelDto, ResponseRoomCollectionDto } from '@accommodation/dto';
import { ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class ResponseHotelDto extends HotelDto {
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    for (let i = 0; i < value.length; i++)
      value[i][1] = new ResponseRoomCollectionDto(value[i][1]);
    return new Types.Map<ResponseRoomCollectionDto>(value);
  })
  rooms: Types.Map<ResponseRoomCollectionDto>;
}
