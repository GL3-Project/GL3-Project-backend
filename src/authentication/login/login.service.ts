import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PopulatedUserDocument } from '@user/schema';
import { UserService } from '@user/user.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signin(user: PopulatedUserDocument) {
    const time = Date.now();
    const access_token = this.jwtService.sign(
      { email: user.email, time },
      { subject: user._id.toString() },
    );
    await this.userService.updateUserAccessToken({ _id: user._id }, time);
    return { access_token };
  }
}
