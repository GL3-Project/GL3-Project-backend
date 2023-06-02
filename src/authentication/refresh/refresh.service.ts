import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PopulatedUserDocument } from '@user/schema';
import { UserService } from '@user/user.service';

@Injectable()
export class RefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async refresh(user: PopulatedUserDocument) {
    const time = Date.now();
    const refresh_token = this.jwtService.sign(
      { email: user.email, time },
      { subject: user._id.toString() },
    );
    await this.userService.updateUserRefreshToken(user._id, time);
    return { refresh_token };
  }
}
