import { Controller, Post, Req } from '@nestjs/common';
import { PopulatedUserDocument } from '@user/schema';
import { UseJwtRefresh } from '@auth/refresh/decorator/jwt.decorator';
import { RefreshService } from '@auth/refresh/refresh.service';
import { LoginService } from '@auth/login/login.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Throttle(6)
export class RefreshController {
  constructor(
    private readonly refreshService: RefreshService,
    private readonly loginService: LoginService,
  ) {}

  @Post('refresh')
  @UseJwtRefresh()
  async refreshToken(@Req() { user }: { user: PopulatedUserDocument }) {
    return {
      ...(await this.refreshService.refresh(user)),
      ...(await this.loginService.signin(user)),
    };
  }
}
