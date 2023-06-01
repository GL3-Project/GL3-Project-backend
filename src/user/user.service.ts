import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserAccount } from '@user/intefaces/user.interface';
import { LocalAccountService } from '@account/local-account.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
	private readonly logger: Logger;

	constructor(
		@InjectRepository(User) private readonly repository: Repository<User>,
		private readonly localAccountService: LocalAccountService,
		protected readonly jwtService: JwtService,
	) {
		this.logger = new Logger(User.name);
	}

	async generateTokens(user: User) {
		const access_token = this.jwtService.sign(
			{ id: user.id },
			{ subject: user.id },
		);

		const refresh_token = this.jwtService.sign(
			{ id: user.id },
			{ subject: user.id },
		);

		user.refreshToken = refresh_token;
		user.accessToken = access_token;
		await user.save();

		return { access_token, refresh_token };
	}

	async invalidateTokens(user: User) {
		user.accessToken = undefined;
		user.refreshToken = undefined;
		await user.save();
	}

	async findWithLocalCredentials(id: string, password: string) {
		const user = await this.repository.findOneBy({ id });
		if (!user) throw new NotFoundException('User was not found');
		else if (!user.accounts[UserAccount.local])
			throw new BadRequestException('User does not have a local account');
		else {
			const authenticated = await this.localAccountService.verify(
				password,
				user.accounts[UserAccount.local],
			);
			if (authenticated) return user;
			else throw new UnauthorizedException('Id or password is incorrect');
		}
	}
}
