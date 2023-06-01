import { IsEmail, IsMongoId, IsNumber } from 'class-validator';
import { Types } from 'mongoose';

export class JwtPayloadDto {
  @IsMongoId()
  sub: Types.ObjectId;

  @IsEmail()
  email: string;

  @IsNumber()
  time: number;
}
