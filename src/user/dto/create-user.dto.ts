import { UserDto } from './user.dto';
import { IsOptional, IsStrongPassword } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto extends UserDto {
  @IsOptional()
  _id: Types.ObjectId;

  @IsStrongPassword(
    {},
    {
      message:
        'password does not meet required constraints. ' +
        'A password must include at least 1 lowercase character, 1 uppercase character, 1 number and 1 symbol.',
    },
  )
  password: string;
}
