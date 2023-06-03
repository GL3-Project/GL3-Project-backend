import { IStrategyOptions, Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { PopulatedUserDocument } from '@user/schema';

export const LOCAL_STRATEGY_NAME = 'login_local';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  LOCAL_STRATEGY_NAME,
) {
  constructor(private userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    } as IStrategyOptions);
  }

  async validate(
    email: string,
    password: string,
  ): Promise<PopulatedUserDocument> {
    try {
      return await this.userService.findPopulatedUserAndVerifyPassword(
        { email },
        password,
      );
    } catch {
      throw new UnauthorizedException('Email or password is incorrect');
    }
  }
}
