import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isArray } from 'class-validator';
import { Document } from 'mongoose';
import { PopulatedUserBookingDocument } from '@booking/user-booking';

const includeCreationDate = (doc) => {
  doc._createdAt = doc.createdAt;
  return doc;
};

@Injectable()
export class BookingInterceptor
  implements
    NestInterceptor<PopulatedUserBookingDocument, PopulatedUserBookingDocument>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PopulatedUserBookingDocument> {
    return next
      .handle()
      .pipe(
        map((data) =>
          isArray(data)
            ? data.map((d) =>
                d instanceof Document
                  ? d.toObject({ transform: includeCreationDate })
                  : d,
              )
            : data instanceof Document
            ? data.toObject({ transform: includeCreationDate })
            : data,
        ),
      );
  }
}
