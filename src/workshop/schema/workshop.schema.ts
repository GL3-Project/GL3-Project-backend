import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

/**
 * Each workshop belongs to a group.
 * All groups have concurrent workshops meaning one can only attend of the workshops in the same group.
 * A group is identified by its id (id >= 0).
 * Creating a new group with a certain id can only be done if all ids strictly inferior to that certain id are taken.
 * Choosing which workshop belongs to which group is of the responsibility of the admin during production.
 * Admin must ensure that no two workshops in the same group can be attended at the same time.
 */
export interface IWorkshop {
  title: string;
  groupId: number;
  description?: string;
  participants: Types.ObjectId[];
  trainer: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
}

export interface IWorkshopMethods {
  isFull(): boolean;
  addParticipant(participant: Types.ObjectId): void;
}

export interface WorkshopModel
  extends Model<IWorkshop, Record<string, never>, IWorkshopMethods> {
  groupsNumber: number;
}

export type WorkshopDocument = InstanceType<WorkshopModel>;

@Schema()
export class Workshop implements IWorkshop {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100,
  })
  title: string;

  @Prop({
    type: Number,
    required: true,
  })
  groupId: number;

  @Prop({
    type: String,
  })
  description?: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'TransportBooking',
      },
    ],
    required: true,
    default: [],
  })
  participants: Types.ObjectId[];

  @Prop({
    type: String,
    required: true,
  })
  trainer: string;

  @Prop({
    type: Number,
    required: true,
    default: 20,
    min: 0,
  })
  capacity: number;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;
}

export const WorkshopSchema = SchemaFactory.createForClass<
  IWorkshop,
  WorkshopModel
>(Workshop);

WorkshopSchema.set('toObject', {
  versionKey: false,
  transform: (doc, ret) => {
    doc.left_places = doc.capacity - doc.participants.length;
    delete doc.capacity;
    delete doc.participants;
    return doc;
  },
});

WorkshopSchema.method('isFull', function () {
  const self: WorkshopDocument = this;
  return self.participants.length === self.capacity;
});

WorkshopSchema.method('addParticipant', function (participant: Types.ObjectId) {
  const self: WorkshopDocument = this;
  if (self.participants.length >= self.capacity)
    throw new BadRequestException(`Workshop ${self.title} is full`);
  self.participants.push(participant);
});
