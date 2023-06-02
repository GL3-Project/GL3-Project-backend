import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UserDocument, UserRole } from '@user/schema';
import { MessagingService, Template } from '@messaging/messaging.service';
import { CreateUserDto } from '@user/dto';
import { UserService } from '@user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FrontConfig } from '@config/front.config';
import { ClientSession } from 'mongoose';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private userService: UserService,
    private messagingService: MessagingService,
    private magicLinkService: JwtService,
    private configService: ConfigService,
  ) {}

  async addParticipant(user: CreateUserDto): Promise<UserDocument> {
    return await this.userService.createUser(user, UserRole.participant);
  }

  async sendAccountActivationEmail(
    user: CreateUserDto,
    session: ClientSession,
  ): Promise<void> {
    let check = false;
    try {
      if (await this.userService.findUser({ email: user.email }, session))
        check = true;
    } catch {}

    if (check) throw new BadRequestException('Email already used');

    const token = this.magicLinkService.sign({ ...user });
    const link =
      this.configService.getOrThrow<FrontConfig>('front').routes
        .account_activation_route +
      '?token=' +
      token;

    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.account_activation,
      data: { first_name: user.firstName, link },
    });
  }

  async sendWelcomingEmail(
    userData: CreateUserDto,
    session: ClientSession,
  ): Promise<void> {
    let check = false;
    try {
      if (await this.userService.findUser({ email: userData.email }, session))
        check = true;
    } catch {}

    if (check)
      throw new BadRequestException(
        'Account is already activated, Try to login.',
      );

    const user = await this.userService.createUser(
      userData,
      UserRole.participant,
      session,
    );

    this.logger.log(`new user: ${user}`);

    const link =
      this.configService.getOrThrow<FrontConfig>('front').routes.login_route;

    await this.messagingService.sendEmail({
      to: { address: user.email, name: user.firstName },
      template: Template.welcome_on_board,
      data: { first_name: user.firstName, link },
    });
  }
}
