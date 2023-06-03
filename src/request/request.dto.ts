import { IRequest, RequestState } from '@request/request.schema';
import { IsEnum } from 'class-validator';

export class RequestDto implements IRequest {
  @IsEnum(RequestState)
  state: RequestState;
}
