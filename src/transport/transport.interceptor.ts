import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transport, TransportDocument } from '@transport/schema';
import { ResponseTransportDto } from '@transport/dto';

@Injectable()
export class TransportInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<null | ResponseTransportDto | ResponseTransportDto[]> {
    return next
      .handle()
      .pipe<null | ResponseTransportDto | ResponseTransportDto[]>(
        map<
          null | TransportDocument | TransportDocument[],
          null | ResponseTransportDto | ResponseTransportDto[]
        >((transport) =>
          Array.isArray(transport)
            ? transport.map((t) => t.toObject())
            : transport instanceof Transport
            ? transport.toObject()
            : null,
        ),
      );
  }
}
