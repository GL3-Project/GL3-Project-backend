import * as process from 'process';
import { registerAs } from '@nestjs/config';

export interface AuthConfig {
	jwt: {
		secret?: string;
		maximumAge: string;
	};
}

export const authConfig = registerAs(
	'auth',
	(): AuthConfig => ({
		jwt: {
			secret: process.env.JWT_SECRET,
			maximumAge: process.env.JWT_MAXIMUM_AGE ?? '1h',
		},
	}),
);
