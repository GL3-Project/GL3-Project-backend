import { IsArray, IsEmail } from 'class-validator';

export class RestoreBookingDto {
  @IsArray()
  @IsEmail({}, { each: true })
  users: string[];
}
