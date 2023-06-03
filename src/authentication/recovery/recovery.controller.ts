import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import { Types } from 'mongoose';
import { UseMagicLinkAuth } from '@auth/recovery/decorator/magic-link.decorator';
import { RecoveryService } from '@auth/recovery/recovery.service';
import { PasswordForgotDto } from '@auth/recovery/dto/password-forgot.dto';
import { PasswordResetDto } from '@auth/recovery/dto/password-reset.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle(6)
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('forgot-password')
  async singUp(@Body() { email }: PasswordForgotDto): Promise<void> {
    await this.recoveryService.sendPasswordResetEmail(email);
  }

  @Put('reset-password')
  @UseMagicLinkAuth()
  async activateAccount(
    @Req() { user: { _id } }: { user: { _id: Types.ObjectId } },
    @Body() { newPassword }: PasswordResetDto,
  ): Promise<void> {
    await this.recoveryService.sendSuccessfulPasswordResetEmail(
      _id,
      newPassword,
    );
  }
}
