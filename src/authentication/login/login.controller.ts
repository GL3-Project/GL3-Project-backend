import { Controller, Post, Req } from '@nestjs/common';
import { LoginService } from '@auth/login/login.service';
import { UseBasicAuth } from '@auth/login/decorator/basic.decorator';
import { PopulatedUserDocument } from '@user/schema';
import { RefreshService } from '@authentication/refresh/refresh.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle(6)
export class LoginController {
  constructor(
    private readonly authService: LoginService,
    private readonly refreshService: RefreshService,
  ) {}

  @Post('signin')
  @UseBasicAuth()
  async signIn(@Req() { user }: { user: PopulatedUserDocument }) {
    return {
      ...(await this.refreshService.refresh(user)),
      ...(await this.authService.signin(user)),
    };
  }
}
