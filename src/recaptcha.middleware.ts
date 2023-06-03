import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { ConfigService } from '@nestjs/config';
import { MiscConfig, ReCaptchaConfig } from '@config';

export interface ReCaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: Date;
  hostname: string;
  'error-codes': string[];
}

export const MINIMUM_RECAPTCHA_SCORE = 0.5;

export const RECAPTCHA_MIDDLEWARE_ACTION_NAME = 'RECAPTCHA_ACTION';

@Injectable()
export class ReCaptchaMiddleware implements NestMiddleware<Request, Response> {
  private readonly reCaptchaConfig: ReCaptchaConfig;
  private readonly axios: AxiosInstance;
  private readonly logger = new Logger(ReCaptchaMiddleware.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(RECAPTCHA_MIDDLEWARE_ACTION_NAME) private readonly action: string,
  ) {
    this.reCaptchaConfig =
      configService.getOrThrow<MiscConfig>('misc').reCaptcha;
    this.axios = axios.create();
    axiosRetry(this.axios, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    console.log(`action: ${this.action}`);
    const { token } = req.body;
    await this.axios
      .post(
        this.reCaptchaConfig.verify.href,
        new URLSearchParams({
          secret: this.reCaptchaConfig.secret,
          response: token,
          remoteip: req.ip,
        }),
      )
      .then((response: AxiosResponse<ReCaptchaResponse>) => {
        if (!response.data.success) {
          this.logger.error(response.data['error-codes']);
          throw new ServiceUnavailableException(
            'ReCaptcha service did not respond. Please retry.',
          );
        }

        if (response.data.score < MINIMUM_RECAPTCHA_SCORE) {
          throw new ForbiddenException(
            'ReCaptcha score too low. Please try again.',
          );
        }

        if (response.data.action !== this.action) {
          throw new BadRequestException('Wrong action.');
        }
      });

    next();
  }
}
