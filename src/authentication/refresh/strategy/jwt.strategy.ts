import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { JwtPayloadDto } from '@auth/refresh/dto/jwt-payload.dto';
import { PopulatedUserDocument } from '@user/schema';
import { UserService } from '@user/user.service';

export const JWT_STRATEGY_NAME = 'refresh_jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const { secret } = configService.getOrThrow<AuthConfig>('auth').refresh.jwt;
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayloadDto): Promise<PopulatedUserDocument> {
    try {
      return await this.userService.findPopulatedUserAndVerifyRefreshToken(
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
