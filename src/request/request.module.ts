import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';
import { InvitationController } from '@request/invitation/invitation.controller';
import { Request, RequestSchema } from '@request/request.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Invitation,
  InvitationSchema,
} from '@request/invitation/schema/invitation.schema';
import { UserModule } from '@user/user.module';
import { MessagingModule } from '@messaging/messaging.module';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from '@booking/booking.module';
import { ContactController } from '@request/contact/contact.controller';
import { ContactService } from '@request/contact/contact.service';
import {
  RECAPTCHA_MIDDLEWARE_ACTION_NAME,
  ReCaptchaMiddleware,
} from '@recaptcha.middleware';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Request.name,
          schema: RequestSchema,
          discriminators: [{ name: Invitation.name, schema: InvitationSchema }],
        },
      ],
      'default',
    ),
    UserModule,
    MessagingModule,
    ConfigModule,
    BookingModule,
  ],
  controllers: [InvitationController, ContactController],
  providers: [
    InvitationService,
    ContactService,
    {
      provide: RECAPTCHA_MIDDLEWARE_ACTION_NAME,
      useValue: `contact/submission`,
    },
  ],
  exports: [],
})
export class RequestModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ReCaptchaMiddleware).forRoutes(ContactController);
  }
}
