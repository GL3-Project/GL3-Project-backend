import { IRoomCollection } from '@accommodation/schema';
import { IsInt, Min, ValidateNested } from 'class-validator';
import { RoomTypeDto } from '@accommodation/dto';

export class ResponseRoomCollectionDto implements Partial<IRoomCollection> {
  @IsInt()
  @Min(0)
  left_places: number;

  @ValidateNested()
  type: RoomTypeDto;

  constructor({
    left_places,
    type,
  }: {
    left_places: number;
    type: RoomTypeDto;
  }) {
    this.left_places = left_places;
    this.type = new RoomTypeDto(type.name, type.capacity, type.price);
  }
}
