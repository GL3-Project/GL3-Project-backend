import * as process from 'process';
import { registerAs } from '@nestjs/config';

export interface NcscConfig {
  edition: string;
  payment: number;
  pricePool: {
    base: number;
    workshop: number;
    pass: number;
  };
}

export const ncscConfig = registerAs(
  'insat',
  (): NcscConfig => ({
    edition: process.env.EDITION ?? 'NCSC',
    payment: 4 * 24 * 3600 * 1000, // 6 days by default
    pricePool: {
      base: parseInt(
        process.env.BOOKING_BASE_PRICE && process.env.BOOKING_BASE_PRICE !== ''
          ? process.env.BOOKING_BASE_PRICE
          : '0',
      ),
      workshop: parseInt(
        process.env.BOOKING_WORKSHOP_PRICE &&
          process.env.BOOKING_WORKSHOP_PRICE !== ''
          ? process.env.BOOKING_WORKSHOP_PRICE
          : '0',
      ),
      pass: parseInt(
        process.env.EVENT_ONLY_PASS_PRICE &&
          process.env.EVENT_ONLY_PASS_PRICE !== ''
          ? process.env.EVENT_ONLY_PASS_PRICE
          : '0',
      ),
    },
  }),
);
