import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export interface ITransport {
  name: string;
  capacity: number;
  fees: number;
  passengers: Types.ObjectId[];
  goingOn?: Date;
  goingFrom?: string;
}

export interface ITransportMethods {
  isFull(): boolean;

  addPassenger(passenger: Types.ObjectId): void;

  removePassenger(passenger: Types.ObjectId): void;
}

export type TransportModel = Model<
  ITransport,
  Record<string, never>,
  ITransportMethods
>;

export type TransportDocument = InstanceType<TransportModel>;

@Schema()
export class Transport implements ITransport {
  @Prop({
    type: String,
    trim: true,
    required: true,
    maxlength: 32,
  })
  name: string;

  @Prop({
    type: Number,
    required: true,
  })
  capacity: number;

  @Prop({
    type: Number,
    required: true,
  })
  fees: number;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    required: true,
    default: [],
  })
  passengers: Types.ObjectId[];

  @Prop({
    type: Date,
    validate: [
      {
        validator(goingOn?: Date): boolean {
          return goingOn === undefined ? true : goingOn.getTime() >= Date.now();
        },
      },
    ],
  })
  goingOn?: Date;

  @Prop({
    type: String,
    maxlength: 100,
  })
  goingFrom?: string;
}

export const TransportSchema = SchemaFactory.createForClass<
  ITransport,
  TransportModel
>(Transport);

TransportSchema.set('toObject', {
  versionKey: false,
  transform: (doc, ret) => {
    doc.left_places = doc.capacity - doc.passengers.length;
    delete doc.capacity;
    delete doc.passengers;
    return doc;
  },
});

TransportSchema.method('isFull', function () {
  const self: TransportDocument = this;
  return self.passengers.length === self.capacity;
});

TransportSchema.method('addPassenger', function (passenger: Types.ObjectId) {
  const self: TransportDocument = this;
  if (self.passengers.length >= self.capacity)
    throw new BadRequestException('This transport is full');
  self.passengers.push(passenger);
});

TransportSchema.method('removePassenger', function (passenger: Types.ObjectId) {
  const self: TransportDocument = this;
  const index = self.passengers.findIndex((id) => id.equals(passenger));

  if (index < 0)
    throw new BadRequestException(
      'This passenger was not found on this transport',
    );

  self.passengers.splice(index, 1);
});
