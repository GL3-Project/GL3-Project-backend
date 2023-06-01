import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from '@configuration/configs/database.config';
import { Environment, miscConfig } from '@configuration/configs/misc.config';
import { ConfigurationService } from '@configuration/configuration.service';
import { ConfigurationModule } from '@configuration/configuration.module';
import { StudentProfileModule } from '@student-profile/student-profile.module';
import { PersonnelProfileModule } from '@personnel-profile/personnel-profile.module';
import { DocumentModule } from '@document/document.module';
import { TemplateModule } from '@template/template.module';
import { AccountModule } from '@account/account.module';
import { AuthenticationModule } from '@authentication/authentication.module';
import { UserModule } from '@user/user.module';
import { authConfig } from '@configuration/configs/auth.config';
import { messagingConfig } from '@configuration/configs/messaging.config';
import { frontConfig } from '@configuration/configs/front.config';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigurationModule],
			inject: [ConfigurationService],
			useFactory: (
				configService: ConfigurationService,
			): TypeOrmModuleOptions => ({
				...(configService.getDatabaseConfig() as Record<never, never>),
				synchronize:
					configService.getMiscConfig().environment !==
					Environment.production,
				ssl: {
					rejectUnauthorized:
						configService.getMiscConfig().environment ===
						Environment.production,
				},
				autoLoadEntities: true,
				logging: 'all',
			}),
		}),
		ConfigurationModule.forRoot({
			envFilePath: [
				'.env.local',
				'.env',
				'.env.production.local',
				'.env.production',
				'.env.development.local',
				'.env.development',
			],
			load: [
				databaseConfig,
				miscConfig,
				authConfig,
				messagingConfig,
				frontConfig,
			],
			expandVariables: true,
			cache: true,
		}),
		StudentProfileModule,
		PersonnelProfileModule,
		DocumentModule,
		TemplateModule,
		AccountModule,
		AuthenticationModule,
		UserModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
