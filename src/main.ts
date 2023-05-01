import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { BaseInterceptor } from '@base/interceptors/base.interceptor';
import { ConfigurationService } from '@configuration/configuration.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigurationService);

	// enable validation
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	// increase the limit for streaming files
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ extended: true, limit: '500mb' }));

	// standardize response
	app.useGlobalInterceptors(new BaseInterceptor());

	// enable logging
	app.useLogger(['log', 'error', 'warn']);

	// configure CORS policy to accept requests only from frontend server
	const { front } = configService.getMiscConfig();
	const allowedOrigins = [front].filter(
		(origin) => origin !== undefined,
	) as string[];
	app.enableCors({ origin: allowedOrigins });

	// get port to listen on from environment variables
	const { port } = configService.getMiscConfig();

	await app.listen(port);
}

bootstrap();
