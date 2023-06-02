import { IWorkshop } from '@workshop/schema/workshop.schema';
import { Types } from 'mongoose';
import {
  IsArray,
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkshopDto implements IWorkshop {
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

  @IsArray()
  @IsMongoId({ each: true })
  participants: Types.ObjectId[];

  @IsString()
  trainer: string;

  @IsInt()
  @Min(0)
  capacity: number;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}
