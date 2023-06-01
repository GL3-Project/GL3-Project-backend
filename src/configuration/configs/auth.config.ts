import * as process from 'process';
import { registerAs } from '@nestjs/config';

export interface AuthConfig {
	magic_link: {
		secret?: string;
		maximumAge: string;
	};
	refresh_token: {
		secret?: string;
		maximumAge: string;
	};
	access_token: {
		secret?: string;
		maximumAge: string;
	};
	reset_password: {
		secret?: string;
		maximumAge: string;
	};
}

export const authConfig = registerAs(
	'auth',
	(): AuthConfig => ({
		magic_link: {
			secret: process.env.MAGIC_LINK_SECRET,
			maximumAge: process.env.MAGIC_LINK_MAXIMUM_AGE ?? '1h',
		},
		refresh_token: {
			secret: process.env.REFRESH_TOKEN_SECRET,
			maximumAge: process.env.REFRESH_TOKEN_MAXIMUM_AGE ?? '1h',
		},
		access_token: {
			secret: process.env.ACCESS_TOKEN_SECRET,
			maximumAge: process.env.ACCESS_TOKEN_MAXIMUM_AGE ?? '1h',
		},
		reset_password: {
			secret: process.env.RESET_PASSWORD_SECRET,
			maximumAge: process.env.RESET_PASSWORD_MAXIMUM_AGE ?? '1h',
		},
	}),
);
