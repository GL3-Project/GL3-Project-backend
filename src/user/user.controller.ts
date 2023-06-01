import { Body, Controller, Get, Header, Post, Req, Res } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { UserDto } from '@user/dto';
import { Role } from '@auth/decorator/role.decorator';
import {
  DeeplyPopulatedUserDocument,
  UserDocument,
  UserRole,
} from '@user/schema';
import { UseJwtAuth } from '@auth/login/decorator/jwt.decorator';
import { Throttle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Response } from 'express';

@Controller('user')
@UseJwtAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectConnection('default') private readonly connection: Connection,
  ) {}

  @Get()
  @Throttle(100, 60)
  @Role(UserRole.participant)
  async getUsers(): Promise<UserDocument[]> {
    return await this.userService.findAllUsers(
      {},
      { firstName: 1, lastName: 1, _id: 1 },
    );
  }

  @Get('all')
  @Role(UserRole.staff)
  async getAllUsers(): Promise<DeeplyPopulatedUserDocument[]> {
    return await this.userService.getAllDeeplyPopulatedUsers();
  }

  @Get('profile')
  @Role(UserRole.participant)
  async getProfile(@Req() { user }: { user: UserDto }): Promise<UserDto> {
    return user;
  }

  @Post('export')
  @Role(UserRole.admin)
  @Header('Content-Type', 'text/csv;charset=utf-8')
  async export(@Body() { users }, @Res() response: Response) {
    return response.send(await this.userService.exportToCSV(users));
  }
}
