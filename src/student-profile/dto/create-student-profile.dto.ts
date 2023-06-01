import { IStudentProfile } from '@student-profile/interfaces/student-profile.interface';
import {
	IsEmail,
	IsNumberString,
	IsPhoneNumber,
	IsString,
	Length,
	MinLength,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSocialsDto } from '@user/dto/create-socials.dto';

export class CreateStudentProfileDto implements Omit<IStudentProfile, 'name'> {
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

	@ValidateNested()
	socials: CreateSocialsDto;
}
