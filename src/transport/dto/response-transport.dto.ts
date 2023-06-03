import { ITransport } from '@transport/schema';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class ResponseTransportDto implements Partial<ITransport> {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsString()
  @MaxLength(32)
  name: string;

  @IsInt()
  @Min(0)
  left_places: number;

  @IsInt()
  @Min(0)
  fees: number;

  @IsOptional()
  @Type(() => Date)
  goingOn?: Date;

  @IsOptional()
  @MaxLength(100)
  goingFrom?: string;
}
