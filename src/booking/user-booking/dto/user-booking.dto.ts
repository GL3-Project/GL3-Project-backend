import { ValidateNested } from 'class-validator';
import { TransportBookingDto } from '@booking/transport-booking';
import { WorkshopBookingDto } from '@booking/workshop-booking';
import { RoomBookingDto } from '@booking/room-booking';

export class UserBookingDto {
  @ValidateNested()
  roomBooking?: RoomBookingDto;

  @ValidateNested()
  transportBooking?: TransportBookingDto;

  @ValidateNested()
  workshopBooking?: WorkshopBookingDto;
}
