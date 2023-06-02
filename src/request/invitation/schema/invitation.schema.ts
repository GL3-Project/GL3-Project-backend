import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IRequest, IRequestMethods, Request } from '@request/request.schema';
import { RoomBookingDocument } from '@booking/room-booking';
import { PopulatedUserDocument } from '@user/schema';

export interface IInvitation extends IRequest {
  host: Types.ObjectId;
  invited: Types.ObjectId;
  room: Types.ObjectId;
}

export interface IInvitationMethods extends IRequestMethods {}

export type InvitationModel = Model<
  IInvitation,
  Record<string, never>,
  IInvitationMethods
>;

export type InvitationDocument = InstanceType<InvitationModel>;

export type PopulatedInvitationDocument = Omit<
  InvitationDocument,
  'room' | 'invited' | 'host'
> & {
  room: RoomBookingDocument;
  invited: PopulatedUserDocument;
  host: PopulatedUserDocument;
};

@Schema({
  timestamps: true,
})
export class Invitation extends Request implements IInvitation {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  host: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  invited: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'RoomBooking',
    required: true,
  })
  room: Types.ObjectId;
}

export const InvitationSchema = SchemaFactory.createForClass<
  IInvitation,
  InvitationModel
>(Invitation);
