import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from '@configuration/configuration.service';

@Module({
	imports: [ConfigModule],
	providers: [ConfigurationService],
	exports: [ConfigurationService],
})
@Global()
export class ConfigurationModule extends ConfigModule {}
