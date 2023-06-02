import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IHotel } from '@accommodation/schema';
import { Types } from 'mongoose';

export class HotelDto implements Partial<IHotel> {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @MaxLength(100, { message: 'name must be at most 100 characters long' })
  name: string;

  @IsString()
  @IsUrl({}, { message: 'website is not a correct link' })
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEmail({}, { message: 'invalid email' })
  @IsOptional()
  email?: string;

  @IsPhoneNumber('TN', { message: 'invalid phone number' })
  @IsOptional()
  phone?: string;
}
