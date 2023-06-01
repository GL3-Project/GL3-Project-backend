import { Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface IRoomType {
  name: string;
  capacity: number;
  price: number;
}

export interface IRoomTypeMethods {}

export type RoomTypeModel = Model<
  IRoomType,
  Record<string, never>,
  IRoomTypeMethods
>;

export type RoomTypeDocument = InstanceType<RoomTypeModel>;

@Schema({
  timestamps: true,
})
export class RoomType implements IRoomType {
  @Prop({
    type: String,
    trim: true,
    index: true,
    required: true,
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
    default: 0,
    validate: [
      {
        validator(price): boolean {
          return price >= 0;
        },
        message: '{PATH} needs to be positive',
      },
    ],
  })
  price: number;
}

export const RoomTypeSchema = SchemaFactory.createForClass<
  IRoomType,
  RoomTypeModel
>(RoomType);
