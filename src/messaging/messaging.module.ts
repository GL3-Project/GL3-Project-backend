import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MessagingConfig } from '@/configuration/configs/messaging.config';

@Module({
	imports: [
		ConfigModule,
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) =>
				config.getOrThrow<MessagingConfig>('messaging').emailing,
		}),
	],
	controllers: [],
	providers: [MessagingService],
	exports: [MessagingService],
})
export class MessagingModule {}
