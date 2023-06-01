import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserAccount, UserRole } from '@user/intefaces/user.interface';
import { LocalAccountService } from '@account/local-account.service';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from '@base/base.service';
import { SignupDto } from '@authentication/dto/signup.dto';
import { StudentProfileService } from '@student-profile/student-profile.service';
import { PersonnelProfileService } from '@personnel-profile/personnel-profile.service';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';
import { Accounts } from '@user/entities/accounts.entity';
import { Profile } from '@user/entities/profile.entity';

@Injectable()
export class UserService extends BaseService<User> {
	constructor(
		@InjectRepository(User) protected readonly repository: Repository<User>,
		private readonly localAccountService: LocalAccountService,
		private readonly jwtService: JwtService,
		private readonly studentService: StudentProfileService,
		private readonly personnelService: PersonnelProfileService,
	) {
		super(repository, User.name);
	}

	async create(createDto: SignupDto) {
		const { role, profile } = createDto;
		const user = await this.repository.create({ role });

		switch (role) {
			case UserRole.student:
				user.profile = await this.studentService.create(profile);
				break;
			case UserRole.personnel:
				user.profile = await this.personnelService.create(profile);
				break;
			default:
				user.profile = profile as Profile;
				break;
		}

		user.accounts = new Accounts();
		if (createDto instanceof LocalSignupDto)
			user.accounts[UserAccount.local] =
				await this.localAccountService.generate(createDto.password);

		await this.repository.save(user);
		return user;
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
