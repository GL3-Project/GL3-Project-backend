import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@user/user.module';
import { MessagingModule } from '@messaging/messaging.module';
import { AccountModule } from '@account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '@configuration/configuration.module';
import { ConfigurationService } from '@configuration/configuration.service';

@Module({
	imports: [
		PassportModule.register({ session: true }),
		UserModule,
		MessagingModule,
		AccountModule,
		JwtModule.registerAsync({
			imports: [ConfigurationModule],
			inject: [ConfigurationService],
			useFactory: async (configService: ConfigurationService) => ({
				secret: configService.getAuthConfig().refresh_token.secret,
				signOptions: {
					expiresIn:
						configService.getAuthConfig().reset_password.maximumAge,
				},
			}),
		}),
	],
	controllers: [AuthenticationController],
	providers: [AuthenticationService],
})
export class AuthenticationModule {}
