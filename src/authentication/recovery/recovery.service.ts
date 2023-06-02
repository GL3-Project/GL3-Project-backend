import { Injectable } from '@nestjs/common';
import { MessagingService, Template } from '@messaging/messaging.service';
import { UserService } from '@user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FrontConfig } from '@config/front.config';
import { Types } from 'mongoose';

@Injectable()
export class RecoveryService {
  constructor(
    private userService: UserService,
    private messagingService: MessagingService,
    private magicLinkService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.findUser({ email });
    const token = this.magicLinkService.sign({ userId: user._id });
    const link =
      this.configService.getOrThrow<FrontConfig>('front').routes
        .password_reset_route +
      '?token=' +
      token;
    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.password_reset,
      data: { first_name: user.firstName, link },
    });
  }

  async sendSuccessfulPasswordResetEmail(
    userId: Types.ObjectId,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.resetUserPassword(userId, newPassword);
    const link =
      this.configService.getOrThrow<FrontConfig>('front').routes.login_route;
    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.successful_password_reset,
      data: {
        first_name: user.firstName,
        link,
        support_email: 'contact@securinets.tn',
      },
    });
  }
}
