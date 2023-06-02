import { IsString } from 'class-validator';

export class AnnouncementPreviewDto {
  @IsString()
  message: string;

  @IsString()
  subject: string;
}
