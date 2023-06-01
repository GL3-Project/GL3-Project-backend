import { Types } from 'mongoose';
import { IsArray, IsMongoId } from 'class-validator';
import { IWorkshopBooking } from '@booking/workshop-booking';
import { Transform } from 'class-transformer';
import { IBooking } from '@booking/booking.schema';

export class WorkshopBookingDto
  implements Omit<IWorkshopBooking, keyof IBooking | 'userId'>
{
  @IsArray()
  @IsMongoId({ each: true })
  @Transform(({ value }) => {
    // todo: not working
    console.log(value.map((item) => (item === null ? undefined : item)));
    return value.map((item) => (item === null ? undefined : item));
  })
  workshopIds: (Types.ObjectId | undefined)[];
}
