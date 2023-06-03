import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Max,
  MaxDate,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IUser } from '@user/schema';
import { Types } from 'mongoose';

export class UserDto implements Partial<IUser> {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @MaxLength(32, { message: 'first name must be at most 32 characters long' })
  firstName: string;

  @IsString()
  @MaxLength(32, { message: 'last name must be at most 32 characters long' })
  lastName: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(99999999, { message: 'CIN must have exactly 8 digits' })
  @Min(10000000, { message: 'CIN must have exactly 8 digits' })
  cin: number;

  @IsString()
  @IsUrl({}, { message: 'linkedin profile is not a correct link' })
  @IsOptional()
  linkedinProfile?: string;

  @Type(() => Date)
  @IsDate()
  @MaxDate(new Date(Date.now() - 18 * 365 * 24 * 3600 * 1000), {
    message: 'you must be at least 18 years old in order to participate',
  })
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  studyField?: string;

  @IsEmail({}, { message: 'invalid email' })
  email: string;

  @IsPhoneNumber('TN', { message: 'invalid phone number' })
  phone: string;

  @IsString()
  university: string;
}
