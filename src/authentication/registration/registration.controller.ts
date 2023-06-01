import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateUserDto } from '@user/dto';
import { UseMagicLinkAuth } from '@auth/registration/decorator/magic-link.decorator';
import { RegistrationService } from '@auth/registration/registration.service';
import { Throttle } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('auth')
@Throttle(6)
export class RegistrationController {
  constructor(
    private readonly magicLinkService: RegistrationService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Post('signup')
  async singUp(@Body() userData: CreateUserDto): Promise<void> {
    const session = await this.connection.startSession();
    await session.withTransaction(async (session) => {
      await this.magicLinkService.sendAccountActivationEmail(userData, session);
    });
  }

  @Post('activate-account')
  @UseMagicLinkAuth()
  async activateAccount(
    @Req() { user }: { user: CreateUserDto },
  ): Promise<void> {
    const session = await this.connection.startSession();
    await session.withTransaction(async (session) => {
      await this.magicLinkService.sendWelcomingEmail(user, session);
    });
  }
}
