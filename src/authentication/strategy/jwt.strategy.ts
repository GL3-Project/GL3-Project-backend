import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadDto } from '@authentication/dto/jwt-payload.dto';
import { UserService } from '@user/user.service';
import { User } from '@user/entities/user.entity';
import { ConfigurationService } from '@configuration/configuration.service';

export const JWT_STRATEGY_NAME = 'jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
	constructor(
		private readonly configService: ConfigurationService,
		private readonly userService: UserService,
	) {
		const { secret } = configService.getAuthConfig().access_token;
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	async validate(payload: JwtPayloadDto): Promise<User> {
		try {
			return this.userService.findOne(payload.id);
		} catch {
			throw new UnauthorizedException('JWT not valid');
		}
	}
}
