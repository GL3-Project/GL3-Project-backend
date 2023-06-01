import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UseBasicAuth } from '@authentication/decorators/basic.decorator';
import { AuthenticatedUser } from '@authentication/decorators/authenticated-user.decorator';
import { User } from '@user/entities/user.entity';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';
import { LocalForgotPasswordDto } from '@authentication/dto/local-forgot-password.dto';
import { LocalResetPasswordDto } from '@authentication/dto/local-reset-password.dto';
import { UseMagicLinkAuth } from '@authentication/decorators/magic-link.decorator';
import { UseJwtAuth } from '@authentication/decorators/jwt.decorator';
import { RefreshLoginDto } from '@authentication/dto/refresh-login.dto';

@Controller('auth')
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@Post('local/signin')
	@UseBasicAuth()
	async signInWithLocalCredentials(@AuthenticatedUser() user: User) {
		return this.authenticationService.localSignIn(user);
	}

	@Post('local/signup')
	async signUpWithLocalCredentials(@Body() signupDto: LocalSignupDto) {
		return this.authenticationService.localSignUp(signupDto);
	}

	@Post('refresh-login')
	@UseJwtAuth()
	async refreshLogin(
		@AuthenticatedUser() user: User,
		@Body() { access_token, refresh_token }: RefreshLoginDto,
	) {
		return this.authenticationService.refreshLogin(
			access_token,
			refresh_token,
			user,
		);
	}

	@Post('local/forgot-password')
	async forgotPassword(@Body() { email }: LocalForgotPasswordDto) {
		return this.authenticationService.forgotPassword(email);
	}

	@Post('local/reset-password')
	@UseMagicLinkAuth()
	async resetPassword(
		@Body() { password }: LocalResetPasswordDto,
		@Req() { user_id },
	) {
		return this.authenticationService.resetPassword(user_id, password);
	}

	@Post('activate-user')
	@UseMagicLinkAuth()
	async activateUser(@Req() { user_id }) {
		return this.authenticationService.activateUser(user_id);
	}
}
