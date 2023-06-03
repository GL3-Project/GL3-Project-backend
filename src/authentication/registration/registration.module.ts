import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { MagicLinkStrategy } from '@auth/registration/strategy/magic-link.strategy';
import { UserModule } from '@user/user.module';
import { MessagingModule } from '@messaging/messaging.module';
import { RegistrationService } from '@auth/registration/registration.service';
import { RegistrationController } from '@auth/registration/registration.controller';
import {
  RECAPTCHA_MIDDLEWARE_ACTION_NAME,
  ReCaptchaMiddleware,
} from '@recaptcha.middleware';

@Module({
  imports: [
    UserModule,
    MessagingModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.getOrThrow<AuthConfig>('auth').registration.magicLink
            .secret,
        signOptions: {
          expiresIn:
            configService.getOrThrow<AuthConfig>('auth').registration.magicLink
              .maximumAge,
        },
      }),
    }),
  ],
  controllers: [RegistrationController],
  providers: [
    RegistrationService,
    MagicLinkStrategy,
    {
      provide: RECAPTCHA_MIDDLEWARE_ACTION_NAME,
      useValue: `signup/submission`,
    },
  ],
  exports: [],
})
export class RegistrationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ReCaptchaMiddleware)
      .forRoutes({ method: RequestMethod.POST, path: 'auth/signup' });
  }
}
