import { Types } from 'mongoose';
import { IsEmail, IsMongoId } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  invited: string;

  @IsMongoId()
  room: Types.ObjectId;
}
