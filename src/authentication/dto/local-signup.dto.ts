import { IsStrongPassword } from 'class-validator';
import { SignupDto } from '@authentication/dto/signup.dto';

export class LocalSignupDto extends SignupDto {
	@IsStrongPassword()
	password: string;
}
