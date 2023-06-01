import { IRoomType } from '@accommodation/schema';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class RoomTypeDto implements IRoomType {
  @IsString()
  @MaxLength(32)
  name: string;

  @IsInt()
  @Min(0)
  capacity: number;

  @IsInt()
  @Min(0)
  price: number;

  constructor(name: string, capacity: number, price: number) {
    this.name = name;
    this.capacity = capacity;
    this.price = price;
  }
}
