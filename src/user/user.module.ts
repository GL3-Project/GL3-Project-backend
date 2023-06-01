import { Module } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { AccountModule } from '@account/account.module';
import { Profile } from '@user/entities/profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '@configuration/configuration.module';
import { ConfigurationService } from '@configuration/configuration.service';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigurationModule],
			inject: [ConfigurationService],
			useFactory: async (configService: ConfigurationService) => ({
				secret: configService.getAuthConfig().jwt.secret,
				signOptions: {
					expiresIn: configService.getAuthConfig().jwt.maximumAge,
				},
			}),
		}),
		TypeOrmModule.forFeature([User, Profile]),
		AccountModule,
	],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}