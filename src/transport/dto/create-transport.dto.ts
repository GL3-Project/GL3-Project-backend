import { TransportDto } from '@transport/dto/transport.dto';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateTransportDto extends TransportDto {
  @IsOptional()
  _id: Types.ObjectId;
}
