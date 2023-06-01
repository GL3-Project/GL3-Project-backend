import { Injectable } from '@nestjs/common';
import { User } from '@user/entities/user.entity';
import { LocalSignupDto } from '@authentication/dto/local-signup.dto';
import { UserService } from '@user/user.service';

@Injectable()
export class AuthenticationService {
	constructor(private readonly userService: UserService) {}

	async localSignIn(user: User) {
		return this.userService.generateTokens(user);
	}

	async localSignUp(dto: LocalSignupDto) {
		// const user = this.userService;
	}
}
