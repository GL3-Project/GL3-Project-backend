import { IStudentProfile } from '@student/interfaces/student.interface';
import { IsString, Length } from 'class-validator';
import { ISocials } from '@user/intefaces/socials.interface';

export class CreateStudentDto implements IStudentProfile {
	@IsString()
	@Length(3, 50)
	firstname: string;
	address: string;
	birthDate: Date;
	cin: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
	socials: ISocials;

	// TODO: complete missing fields. Some fields might not be necessary here. Also, take your time with decorators.
}
