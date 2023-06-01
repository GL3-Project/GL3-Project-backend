import { Injectable } from '@nestjs/common';
import { User } from '@user/entities/user.entity';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';
import { UserService } from '@user/user.service';
import { MessagingService, Template } from '@messaging/messaging.service';
import { ConfigurationService } from '@configuration/configuration.service';
import { LocalAccountService } from '@account/local-account.service';
import { UserAccount } from '@user/intefaces/user.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly userService: UserService,
		private readonly messagingService: MessagingService,
		private readonly configService: ConfigurationService,
		private readonly localAccountService: LocalAccountService,
		private readonly jwtService: JwtService,
	) {}

	async localSignIn(user: User) {
		return this.userService.generateTokens(user);
	}

	async localSignUp(dto: LocalSignupDto) {
		const user = await this.userService.create(dto);
		await this.messagingService.sendEmail({
			template: Template.account_activation,
			to: { address: user.profile.email, name: user.profile.name() },
			data: {},
		});
		return user.id;
	}

	async activateAccount(id: string) {
		const user = await this.userService.findOne(id);
		const tokens = await this.userService.generateTokens(user);
		await this.messagingService.sendEmail({
			template: Template.welcome_on_board,
			to: { address: user.profile.email, name: user.profile.name() },
			data: {},
		});
		return tokens;
	}

	async forgotPassword(email: string) {
		const user = await this.userService.findBy({ profile: { email } });
		const token = this.jwtService.sign({ id: user.id });
		const link =
			this.configService.getFrontConfig().routes.password_reset_route +
			'?token=' +
			token;
		await this.messagingService.sendEmail({
			to: { address: user.profile.email, name: user.profile.name() },
			template: Template.password_reset,
			data: { first_name: user.profile.name(), link },
		});
	}

	async resetPassword(id: string, newPassword: string): Promise<void> {
		const user = await this.userService.findOne(id);
		await this.localAccountService.reset(
			newPassword,
			user.accounts[UserAccount.local],
		);
		const link = this.configService.getFrontConfig().routes.login_route;
		await this.messagingService.sendEmail({
			to: { address: user.profile.email, name: user.profile.name() },
			template: Template.successful_password_reset,
			data: {
				first_name: user.profile.name(),
				link,
				support_email: 'contact@insat.ucar.tn',
			},
		});
	}
}
