import { Model, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Booking,
  BookingKind,
  IBooking,
  IBookingMethods,
} from '@booking/booking.schema';
import { WorkshopDocument } from '@workshop/schema';
import { BadRequestException } from '@nestjs/common';

/**
 * Each workshop booking has the workshops that its participant will participate in.
 * The length of workshops is the number of groups of workshops. More on that in workshop schema.
 * One can find the group to which a chosen workshop belongs by finding its index inside the workshopIds array (index === id).
 * If the participant did not choose a workshop in a certain group, the value stored in the array must be `undefined`.
 */
export interface IWorkshopBooking extends IBooking {
  workshopIds: (Types.ObjectId | undefined)[];
  userId: Types.ObjectId;
}

export type IWorkshopBookingMethods = IBookingMethods & {
  changeWorkshop(groupId: number, workshop: WorkshopDocument | undefined): void;
};

export type WorkshopBookingModel = Model<
  IWorkshopBooking,
  Record<string, never>,
  IWorkshopBookingMethods
>;

export type WorkshopBookingDocument = InstanceType<WorkshopBookingModel>;

@Schema({
  timestamps: true,
})
export class WorkshopBooking extends Booking implements IWorkshopBooking {
  static price: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Workshop' }],
    required: true,
  })
  workshopIds: (Types.ObjectId | undefined)[];

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;
}

export const WorkshopBookingSchema = SchemaFactory.createForClass<
  IWorkshopBooking,
  WorkshopBookingModel
>(WorkshopBooking);

WorkshopBookingSchema.method(
  'changeWorkshop',
  function (groupId: number, workshop: WorkshopDocument | undefined) {
    const self: WorkshopBookingDocument = this;

    if (groupId >= self.workshopIds.length)
      throw new BadRequestException('Incorrect group id');

    if (workshop === undefined) {
      self.workshopIds[groupId] = undefined;
    } else if (workshop.groupId !== groupId) {
      throw new BadRequestException('Incorrect workshop group id');
    } else if (
      self.workshopIds[groupId] !== undefined &&
      !self.workshopIds[groupId]!.equals(workshop._id) &&
      workshop.isFull()
    ) {
      throw new BadRequestException('Workshop is full');
    } else {
      self.workshopIds[groupId] = workshop._id;
    }
  },
);
