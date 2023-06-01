import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsOptional, ValidateIf } from 'class-validator';
import { IWorkshopBooking } from '@booking/workshop-booking';
import { IBooking } from '@booking/booking.schema';

export class CreateWorkshopBookingDto
  implements Omit<IWorkshopBooking, keyof IBooking | 'userId'>
{
  @IsArray()
  @IsOptional({ each: true })
  @ValidateIf(
    (object, value) => {
      console.log('validating');
      return value === null;
    },
    { each: true },
  )
  @IsMongoId({ each: true })
  workshopIds: (Types.ObjectId | undefined)[];

  constructor(workshopIds: Types.ObjectId[]) {
    this.workshopIds = workshopIds;
  }
}
