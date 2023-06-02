import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IRoomType,
  RoomTypeSchema,
} from '@accommodation/schema/room-type.schema';

export interface IRoomCollection {
  bookings: Types.ObjectId[];
  count: number;
  type: IRoomType;
}

@Schema()
export class RoomCollection implements IRoomCollection {
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'RoomBooking',
      },
    ],
    required: true,
    default: [],
  })
  bookings: Types.ObjectId[];

  @Prop({
    type: Number,
    required: true,
    default: 0,
    validate: [
      {
        validator(price): boolean {
          return price >= 0;
        },
        message: '{PATH} needs to be positive',
      },
      {
        /**
         * make sure that bookings never exceed total number of rooms.
         * Especially in the case of removing rooms,
         * where it is desired to remove rooms only from free ones.
         *
         * @param count - `count` field in `Room`
         */
        validator(count): boolean {
          return this.bookings.length <= count;
        },
        message: 'Bookings exceeded available rooms',
      },
    ],
  })
  count: number;

  @Prop({
    type: RoomTypeSchema,
    immutable: true,
    required: true,
  })
  type: IRoomType;

  constructor(room: Partial<IRoomCollection>) {
    this.bookings = room.bookings ?? [];
    if (room.count) this.count = room.count;
    if (room.type) this.type = room.type;
  }
}

export const RoomCollectionSchema =
  SchemaFactory.createForClass(RoomCollection);
