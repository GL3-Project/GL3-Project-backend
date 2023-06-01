import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayloadDto } from '@authentication/dto/jwt-payload.dto';
import { UserService } from '@user/user.service';
import { ConfigurationService } from '@configuration/configuration.service';

export const MAGIC_LINK_STRATEGY_NAME = 'magic_link';

@Injectable()
export class JwtStrategy extends PassportStrategy(
	Strategy,
	MAGIC_LINK_STRATEGY_NAME,
) {
	constructor(
		private readonly configService: ConfigurationService,
		private readonly userService: UserService,
	) {
		const { secret } = configService.getAuthConfig().magic_link;
		super({
			jwtFromRequest: ExtractJwt.fromBodyField('token'),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	async validate(payload: JwtPayloadDto): Promise<string> {
		return payload.id;
	}
}
