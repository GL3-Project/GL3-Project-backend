import * as process from 'process';
import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  uri?: string;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST ?? '127.0.0.1',
    port: parseInt(
      process.env.MONGO_PORT && process.env.MONGO_PORT !== ''
        ? process.env.MONGO_PORT
        : '27017',
    ),
    uri: process.env.MONGO_URI,
  }),
);
