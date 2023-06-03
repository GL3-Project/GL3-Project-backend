import * as process from 'process';
import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export interface ReCaptchaConfig {
  secret: string;
  verify: URL;
  siteKey: string;
}

export enum Environment {
  dev = 'development',
  prod = 'production',
  test = 'test',
}

export interface MiscConfig {
  port: number;
  front?: string;
  dashboard?: string;
  environment: Environment;
  reCaptcha: ReCaptchaConfig;
  throttler: ThrottlerModuleOptions;
}

export const miscConfig = registerAs('misc', (): MiscConfig => {
  if (process.env.GOOGLE_RECAPTCHA_VERIFY_TOKEN === undefined)
    throw new InternalServerErrorException(
      'No Google ReCaptcha verify endpoint',
    );

  if (process.env.GOOGLE_RECAPTCHA_SECRET_KEY === undefined)
    throw new InternalServerErrorException('No Google ReCaptcha secret');

  if (process.env.GOOGLE_RECAPTCHA_SITE_KEY === undefined)
    throw new InternalServerErrorException('No Google ReCaptcha site key');

  return {
    port: parseInt(
      process.env.PORT && process.env.PORT !== '' ? process.env.PORT : '3000',
    ),
    front: process.env.FRONT_URI,
    dashboard: process.env.DASHBOARD_URI,
    reCaptcha: {
      secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      siteKey: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
      verify: new URL(process.env.GOOGLE_RECAPTCHA_VERIFY_TOKEN),
    },
    environment:
      process.env.NODE_ENV === Environment.prod
        ? Environment.prod
        : process.env.NODE_ENV === Environment.test
        ? Environment.test
        : Environment.dev,
    throttler: {
      ttl: parseInt(
        process.env.THROTTLER_TTL && process.env.THROTTLER_TTL !== ''
          ? process.env.THROTTLER_TTL
          : '60',
      ),
      limit: parseInt(
        process.env.THROTTLER_LIMIT && process.env.THROTTLER_LIMIT !== ''
          ? process.env.THROTTLER_LIMIT
          : '10',
      ),
    },
  };
});
