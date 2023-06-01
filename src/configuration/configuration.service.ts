import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@configuration/configs/database.config';
import { MiscConfig } from '@configuration/configs/misc.config';
import { AuthConfig } from '@configuration/configs/auth.config';
import { MessagingConfig } from '@configuration/configs/messaging.config';

@Injectable()
export class ConfigurationService extends ConfigService {
	getDatabaseConfig(): DatabaseConfig {
		return this.getOrThrow<DatabaseConfig>('database');
	}

	getMiscConfig(): MiscConfig {
		return this.getOrThrow<MiscConfig>('misc');
	}

	getAuthConfig(): AuthConfig {
		return this.getOrThrow<AuthConfig>('auth');
	}

	getMessagingConfig(): MessagingConfig {
		return this.getOrThrow<MessagingConfig>('messaging');
	}
}
