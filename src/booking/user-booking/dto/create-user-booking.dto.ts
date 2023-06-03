import { IsOptional, ValidateNested } from 'class-validator';
import { CreateTransportBookingDto } from '@booking/transport-booking';
import { CreateWorkshopBookingDto } from '@booking/workshop-booking';
import { CreateRoomBookingDto } from '@booking/room-booking';
import { Type } from 'class-transformer';

export class CreateUserBookingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRoomBookingDto)
  roomBooking?: CreateRoomBookingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTransportBookingDto)
  transportBooking?: CreateTransportBookingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateWorkshopBookingDto)
  workshopBooking?: CreateWorkshopBookingDto;
}
