import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { CreateUserDto } from '@user/dto';

export const MAGIC_LINK_STRATEGY_NAME = 'registration_magic-link';

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(
  Strategy,
  MAGIC_LINK_STRATEGY_NAME,
) {
  constructor(private readonly configService: ConfigService) {
    const { secret } =
      configService.getOrThrow<AuthConfig>('auth').registration.magicLink;

    if (secret === undefined)
      throw new InternalServerErrorException(
        'Missing magic link configuration',
      );

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(user: CreateUserDto) {
    try {
      return user;
    } catch {
      throw new UnauthorizedException(
        'The token that you provided is invalid.',
      );
    }
  }
}
