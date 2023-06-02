import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HotelDocument } from '@accommodation/schema';
import { ResponseHotelDto } from '@accommodation/dto';
import { Document } from 'mongoose';

@Injectable()
export class AccommodationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<null | ResponseHotelDto | ResponseHotelDto[]> {
    return next
      .handle()
      .pipe<null | ResponseHotelDto | ResponseHotelDto[]>(
        map<
          null | HotelDocument | HotelDocument[],
          null | ResponseHotelDto | ResponseHotelDto[]
        >((hotel) =>
          Array.isArray(hotel)
            ? hotel.map((h) => h.toObject())
            : hotel instanceof Document
            ? hotel.toObject()
            : hotel,
        ),
      );
  }
}
