import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from '@config';
import { Types } from 'mongoose';

export const MAGIC_LINK_STRATEGY_NAME = 'recovery_magic-link';

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(
  Strategy,
  MAGIC_LINK_STRATEGY_NAME,
) {
  constructor(private readonly configService: ConfigService) {
    const { secret } =
      configService.getOrThrow<AuthConfig>('auth').recovery.magicLink;

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

  async validate({ userId }: { userId: string }) {
    try {
      return { _id: new Types.ObjectId(userId) };
    } catch {
      throw new UnauthorizedException('Token not valid');
    }
  }
}
