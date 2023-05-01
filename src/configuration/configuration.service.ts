import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@configuration/configs/database.config';
import { MiscConfig } from '@configuration/configs/misc.config';

@Injectable()
export class ConfigurationService extends ConfigService {
	getDatabaseConfig(): DatabaseConfig {
		return this.getOrThrow<DatabaseConfig>('database');
	}

	getMiscConfig(): MiscConfig {
		return this.getOrThrow<MiscConfig>('misc');
	}
}
