import { IPersonnel } from '@personnel/interfaces/personnel.interface';
import { IsString, Length } from 'class-validator';

export class CreatePersonnelDto implements IPersonnel {
	@IsString()
	@Length(3, 50)
	firstname: string;

	// TODO: complete missing fields. Some fields might not be necessary here. Also, take your time with decorators.
}
