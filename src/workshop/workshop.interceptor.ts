import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Workshop, WorkshopDocument } from '@workshop/schema';
import { ResponseWorkshopDto } from '@workshop/dto';

@Injectable()
export class WorkshopInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<null | ResponseWorkshopDto | ResponseWorkshopDto[]> {
    return next
      .handle()
      .pipe<null | ResponseWorkshopDto | ResponseWorkshopDto[]>(
        map<
          null | WorkshopDocument | WorkshopDocument[],
          null | ResponseWorkshopDto | ResponseWorkshopDto[]
        >((workshop) =>
          Array.isArray(workshop)
            ? workshop.map((w) => w.toObject())
            : workshop instanceof Workshop
            ? workshop.toObject()
            : null,
        ),
      );
  }
}
