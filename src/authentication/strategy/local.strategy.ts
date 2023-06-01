import { IStrategyOptions, Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { User } from '@user/entities/user.entity';

export const LOCAL_STRATEGY_NAME = 'local';

@Injectable()
export class LocalStrategy extends PassportStrategy(
	Strategy,
	LOCAL_STRATEGY_NAME,
) {
	constructor(private userService: UserService) {
		super({
			usernameField: 'id',
			passwordField: 'password',
		} as IStrategyOptions);
	}

	async validate(id: string, password: string): Promise<User> {
		try {
			return this.userService.findWithLocalCredentials(id, password);
		} catch {
			throw new UnauthorizedException('Id or password is incorrect');
		}
	}
}
