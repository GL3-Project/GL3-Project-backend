import { registerAs } from '@nestjs/config';
import * as process from 'process';

export interface FrontConfig {
  uri?: string;
  routes: {
    account_activation_route?: string;
    password_reset_route?: string;
    login_route?: string;
    profile_route?: string;
    faq_route?: string;
  };
}

export const frontConfig = registerAs(
  'front',
  (): FrontConfig => ({
    uri: process.env.FRONT_URI,
    routes: {
      account_activation_route: process.env.FRONT_ACCOUNT_ACTIVATION,
      password_reset_route: process.env.FRONT_PASSWORD_RESET,
      login_route: process.env.FRONT_LOGIN,
      profile_route: process.env.FRONT_PROFILE,
      faq_route: process.env.FRONT_FAQ,
    },
  }),
);
