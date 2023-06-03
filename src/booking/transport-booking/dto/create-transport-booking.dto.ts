import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';
import { ITransportBooking } from '@booking/transport-booking';
import { IBooking } from '@booking/booking.schema';

export class CreateTransportBookingDto
  implements Omit<ITransportBooking, keyof IBooking | 'userId'>
{
  @IsMongoId()
  transportId: Types.ObjectId;

  constructor(transportId: Types.ObjectId) {
    this.transportId = transportId;
  }
}
