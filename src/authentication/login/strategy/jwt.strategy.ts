import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { JwtPayloadDto } from '@auth/login/dto/jwt-payload.dto';
import { PopulatedUserDocument } from '@user/schema';
import { UserService } from '@user/user.service';
import { RefreshService } from '@authentication/refresh/refresh.service';

export const JWT_STRATEGY_NAME = 'login_jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    private readonly configService: ConfigService,
    private readonly refreshService: RefreshService,
    private readonly userService: UserService,
  ) {
    const { secret } = configService.getOrThrow<AuthConfig>('auth').login.jwt;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayloadDto): Promise<PopulatedUserDocument> {
    try {
      return await this.userService.findPopulatedUserAndVerifyAccessToken(
        {
          _id: payload.sub,
          email: payload.email,
        },
        payload.time,
      );
    } catch {
      throw new UnauthorizedException('JWT not valid');
    }
  }
}
