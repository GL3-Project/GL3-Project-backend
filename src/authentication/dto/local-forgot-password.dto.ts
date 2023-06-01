import { IsEmail } from 'class-validator';

export class LocalForgotPasswordDto {
	@IsEmail()
	email: string;
}
