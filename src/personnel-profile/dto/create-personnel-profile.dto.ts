import { IPersonnelProfile } from '@personnel-profile/interfaces/personnel-profile.interface';
import {
	IsEmail,
	IsNumberString,
	IsPhoneNumber,
	IsString,
	Length,
	MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonnelProfileDto
	implements Omit<IPersonnelProfile, 'name'>
{
	@IsString()
	@Length(3, 50)
	firstName: string;

	@IsString()
	@Length(3, 50)
	lastName: string;

	@IsString()
	@MinLength(10)
	address: string;

	@Type(() => Date)
	birthDate: Date;

	@IsNumberString()
	cin: string;
	@IsEmail()
	email: string;

	@IsPhoneNumber('TN')
	phone: string;
}
