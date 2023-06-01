import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UseBasicAuth } from '@authentication/decorators/basic.decorator';
import { AuthenticatedUser } from '@authentication/decorators/authenticated-user.decorator';
import { User } from '@user/entities/user.entity';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('signin/local')
	@UseBasicAuth()
	async signInWithLocalCredentials(@AuthenticatedUser() user: User) {
		return this.authenticationService.localSignIn(user);
	}

	@Post('signup/local')
	async signUpWithLocalCredentials(@Body() signupDto: LocalSignupDto) {
		return this.authenticationService.localSignUp(signupDto);
	}
}
