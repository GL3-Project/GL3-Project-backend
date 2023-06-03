import { WorkshopDto } from '@workshop/dto/workshop.dto';
import { Types } from 'mongoose';
import { IsOptional } from 'class-validator';

export class CreateWorkshopDto extends WorkshopDto {
  @IsOptional()
  _id: Types.ObjectId;

  @IsOptional()
  participants: Types.ObjectId[];
}
