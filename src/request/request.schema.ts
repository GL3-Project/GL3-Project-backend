import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export enum RequestState {
  in_progress = 'in_progress',
  completed = 'completed',
  cancelled = 'cancelled',
  rejected = 'rejected',
}

export interface IRequest {
  state: RequestState;
}

export interface IRequestMethods {
  complete();

  reject();

  cancel();
}

export type RequestModel = Model<
  IRequest,
  Record<string, never>,
  IRequestMethods
>;

export type RequestDocument = InstanceType<RequestModel>;

@Schema({
  timestamps: true,
})
export class Request implements IRequest {
  @Prop({
    type: String,
    enum: RequestState,
    required: true,
    default: RequestState.in_progress,
    index: true,
  })
  state: RequestState;
}

export const RequestSchema = SchemaFactory.createForClass<
  IRequest,
  RequestModel
>(Request);

RequestSchema.method('complete', function () {
  const self: IRequest = this;
  if (self.state === RequestState.completed)
    throw new BadRequestException('This invitation is already accepted');
  self.state = RequestState.completed;
});

RequestSchema.method('reject', function () {
  const self: IRequest = this;
  if (self.state === RequestState.rejected)
    throw new BadRequestException('This invitation is already rejected');
  self.state = RequestState.rejected;
});

RequestSchema.method('cancel', function () {
  const self: IRequest = this;
  if (self.state === RequestState.cancelled)
    throw new BadRequestException('This invitation is already cancelled');
  self.state = RequestState.cancelled;
});
