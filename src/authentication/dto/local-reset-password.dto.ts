import { IsStrongPassword } from 'class-validator';

export class LocalResetPasswordDto {
	@IsStrongPassword()
	password: string;
}
