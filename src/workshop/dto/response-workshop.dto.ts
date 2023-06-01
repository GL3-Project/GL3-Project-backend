import { IWorkshop } from '@workshop/schema';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class ResponseWorkshopDto implements Partial<IWorkshop> {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsInt()
  groupId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  trainer: string;

  @IsInt()
  @Min(0)
  left_places: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
