import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoomType, RoomTypeSchema } from '@accommodation/schema';
import { Booking, IBooking, IBookingMethods } from '@booking/booking.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserDocument } from '@user/schema';

export interface IRoomBooking extends IBooking {
  hotelId: Types.ObjectId;
  roommates: Types.ObjectId[];
  roomType: RoomType;
}

export interface IRoomBookingMethods extends IBookingMethods {
  addRoommate(userId: Types.ObjectId): void;

  removeRoommate(userId: Types.ObjectId): void;
}

export type RoomBookingModel = Model<
  IRoomBooking,
  Record<string, never>,
  IRoomBookingMethods
>;

export type RoomBookingDocument = InstanceType<RoomBookingModel>;

export type PopulatedRoomBookingDocument = Omit<
  RoomBookingDocument,
  'roommates'
> & {
  roommates: UserDocument[];
};

@Schema({
  timestamps: true,
})
export class RoomBooking extends Booking implements IRoomBooking {
  @Prop({
    type: Types.ObjectId,
    ref: 'Hotel',
    required: true,
  })
  hotelId: Types.ObjectId;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    required: true,
    default: [],
    validate: [
      {
        validator(roommates: Types.ObjectId[]) {
          return this.roomType.capacity >= roommates.length;
        },
      },
    ],
  })
  roommates: Types.ObjectId[];

  @Prop({
    type: RoomTypeSchema,
    required: true,
  })
  roomType: RoomType;
}

export const RoomBookingSchema = SchemaFactory.createForClass<
  IRoomBooking,
  RoomBookingModel
>(RoomBooking);

RoomBookingSchema.method('getPrice', function (): number {
  const self: IRoomBooking = this;
  return self.roomType.price / self.roomType.capacity;
});

RoomBookingSchema.method(
  'addRoommate',
  function (userId: Types.ObjectId): void {
    const self: IRoomBooking = this;
    if (self.roommates.length < self.roomType.capacity)
      self.roommates.push(userId);
    else
      throw new BadRequestException(
        'Can not add another roommate. Maximum room capacity already reached.',
      );
  },
);

RoomBookingSchema.method(
  'removeRoommate',
  function (userId: Types.ObjectId): void {
    const self: IRoomBooking = this;
    const index = self.roommates.findIndex((id) => id.equals(userId));

    if (index === -1)
      throw new NotFoundException('Roommate not found in booking.');
    else self.roommates.splice(index, 1);
  },
);
