import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseConfig } from '@configuration/configs/database.config';
import { Environment, miscConfig } from '@configuration/configs/misc.config';
import { ConfigurationService } from '@configuration/configuration.service';
import { ConfigurationModule } from '@configuration/configuration.module';
import { StudentModule } from '@student/student.module';
import { PersonnelModule } from '@personnel/personnel.module';
import { DocumentModule } from '@document/document.module';
import { TemplateModule } from '@template/template.module';

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
			load: [databaseConfig, miscConfig],
			expandVariables: true,
			cache: true,
		}),
		StudentModule,
		PersonnelModule,
		DocumentModule,
		TemplateModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
