import { IsEmail, IsString } from 'class-validator';

export class AnnouncementDto {
  @IsEmail({}, { each: true })
  recipients: string[];

  @IsString()
  message: string;

  @IsString()
  subject: string;
}
