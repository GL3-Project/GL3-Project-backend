import { IStudent } from '@student/interfaces/template.interface';
import { IsString, Length } from 'class-validator';

export class CreateStudentDto implements IStudent {
	@IsString()
	@Length(3, 50)
	firstname: string;

	// TODO: complete missing fields. Some fields might not be necessary here. Also, take your time with decorators.
}
