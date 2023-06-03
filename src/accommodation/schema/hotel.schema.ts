import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoomCollection, RoomCollectionSchema } from '@accommodation/schema';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export interface IHotel {
  name: string;
  rooms: Types.Map<RoomCollection>;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IHotelMethods {
  addRooms(roomType: string, count: number): void;

  removeRooms(roomType: string, count: number): void;

  addBooking(booking: Types.ObjectId, roomType: string): void;

  removeBooking(booking: Types.ObjectId, roomType: string): void;
}

export type HotelModel = Model<IHotel, Record<string, never>, IHotelMethods>;

export type HotelDocument = InstanceType<HotelModel>;

@Schema({
  timestamps: true,
})
export class Hotel implements IHotel {
  @Prop({
    type: String,
    required: true,
    maxlength: 100,
  })
  name: string;

  @Prop({
    type: Types.Map,
    of: RoomCollectionSchema,
    required: true,
    validate: [
      {
        /**
         * make sure that only rooms of type `Room` are present in this field.
         *
         * @param rooms - `rooms` field in `Hotel`
         */
        validator(rooms: Types.Map<RoomCollection>): boolean {
          let valid = true;
          for (const [roomType, room] of rooms)
            valid &&= room.type.name === roomType;
          return valid;
        },
        message: 'Inconsistency in data',
      },
    ],
  })
  rooms: Types.Map<RoomCollection>;

  @Prop({
    type: String,
    validate: {
      validator: function (url) {
        return new URL(url);
      },
      message: '{PATH} is not a valid URL',
    },
  })
  website?: string;

  @Prop({
    type: String,
  })
  address?: string;

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
  })
  email?: string;

  @Prop({
    type: String,
  })
  phone?: string;
}

export const HotelSchema = SchemaFactory.createForClass<IHotel, HotelModel>(
  Hotel,
);

HotelSchema.set('toObject', {
  versionKey: false,
  transform: (doc, ret) => {
    const entries = Array.from(
      doc.rooms instanceof Types.Map
        ? doc.rooms.entries()
        : Object.entries(doc.rooms),
    ).map(([key, roomCollection]) => {
      roomCollection.left_places =
        roomCollection.count - roomCollection.bookings.length;
      delete roomCollection.count;
      delete roomCollection.bookings;
      return [key, roomCollection];
    });
    doc.rooms = Object.fromEntries(entries);
    return doc;
  },
});

HotelSchema.method(
  'addRooms',
  function (roomType: string, count: number): void {
    const rooms: Types.Map<RoomCollection> = this.rooms;
    if (rooms.has(roomType)) {
      const roomCollection = rooms.get(roomType)!;
      roomCollection.count += count;
      rooms.set(roomType, roomCollection);
    } else {
      throw new InternalServerErrorException(
        `there is no ${roomType} in rooms`,
      );
    }
  },
);

HotelSchema.method(
  'removeRooms',
  function (roomType: string, count: number): void {
    const rooms: Types.Map<RoomCollection> = this.rooms;
    if (rooms.has(roomType)) {
      const roomCollection = rooms.get(roomType)!;
      if (roomCollection.count - count >= roomCollection.bookings.length) {
        roomCollection.count -= count;
        rooms.set(roomType, roomCollection);
      } else {
        throw new InternalServerErrorException(
          'Not enough free rooms to remove',
        );
      }
    } else {
      throw new InternalServerErrorException(
        `there is no ${roomType} in rooms`,
      );
    }
  },
);

HotelSchema.method(
  'addBooking',
  function (booking: Types.ObjectId, roomType: string) {
    const self: HotelDocument = this;
    console.log('sec');
    const roomCollection = self.rooms[roomType];

    if (roomCollection === undefined)
      throw new NotFoundException(
        'This type of room does not exist in this hotel',
      );

    if (roomCollection.bookings.length >= roomCollection.count)
      throw new BadRequestException(
        'There are no longer rooms of this type available',
      );

    roomCollection.bookings.push(booking);
    self.rooms[roomType] = roomCollection;
    self.rooms = new Types.Map<RoomCollection>(self.rooms);
  },
);

HotelSchema.method(
  'removeBooking',
  function (booking: Types.ObjectId, roomType: string) {
    const self: HotelDocument = this;
    const roomCollection = self.rooms[roomType];

    if (roomCollection === undefined)
      throw new NotFoundException('Room not found');

    const index = roomCollection.bookings.findIndex((id) => id.equals(booking));

    if (index < 0)
      throw new BadRequestException('This booking was not found on this hotel');

    roomCollection.bookings.splice(index, 1);
    self.rooms[roomType] = roomCollection;
  },
);
