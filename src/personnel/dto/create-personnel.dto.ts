import { IPersonnelProfile } from '@personnel/interfaces/personnel.interface';
import { IsString, Length } from 'class-validator';

export class CreatePersonnelDto implements IPersonnelProfile {
	@IsString()
	@Length(3, 50)
	firstName: string;
	address: string;
	birthDate: Date;
	cin: string;
	email: string;
	lastName: string;
	phone: string;

	// TODO: complete missing fields. Some fields might not be necessary here. Also, take your time with decorators.
}
