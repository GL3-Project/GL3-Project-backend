import * as process from 'process';
import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  login: {
    magicLink: {
      secret?: string;
      maximumAge: string;
    };
    jwt: {
      secret?: string;
      maximumAge: string;
    };
  };
  registration: {
    magicLink: {
      secret?: string;
      maximumAge: string;
    };
  };
  refresh: {
    jwt: {
      secret?: string;
      maximumAge: string;
    };
  };
  recovery: {
    magicLink: {
      secret?: string;
      maximumAge: string;
    };
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    login: {
      magicLink: {
        secret: process.env.LOGIN_MAGIC_LINK_SECRET,
        maximumAge: process.env.LOGIN_MAGIC_LINK_MAXIMUM_AGE ?? '30m',
      },
      jwt: {
        secret: process.env.LOGIN_JWT_SECRET,
        maximumAge: process.env.LOGIN_JWT_MAXIMUM_AGE ?? '30m',
      },
    },
    registration: {
      magicLink: {
        secret: process.env.REGISTRATION_MAGIC_LINK_SECRET,
        maximumAge: process.env.REGISTRATION_MAGIC_LINK_MAXIMUM_AGE ?? '7d',
      },
    },
    refresh: {
      jwt: {
        secret: process.env.REFRESH_JWT_SECRET,
        maximumAge: process.env.REFRESH_JWT_MAXIMUM_AGE ?? '10m',
      },
    },
    recovery: {
      magicLink: {
        secret: process.env.PASSWORD_RESET_MAGIC_LINK_SECRET,
        maximumAge: process.env.PASSWORD_RESET_MAGIC_LINK_MAXIMUM_AGE ?? '30m',
      },
    },
  }),
);
