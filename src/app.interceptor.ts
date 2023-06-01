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

export interface Response<T> {
  statusCode: number;
  message: string;
  data?: T;
}

const computeSafeResponse = (doc, ret) => {
  ret.kind = ret.__t;

  delete ret.createdAt;
  delete ret.updatedAt;
  delete ret.__v;
  delete ret.__t;

  return ret;
};

@Injectable()
export class AppInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) =>
        isArray(data)
          ? data.map((d) =>
              d instanceof Document
                ? d.toObject({ transform: computeSafeResponse })
                : d,
            )
          : data instanceof Document
          ? data.toObject({ transform: computeSafeResponse })
          : data,
      ),
      map<T, Response<T>>((data) =>
        data === undefined
          ? {
              message: 'Success',
              statusCode: context.switchToHttp().getResponse().statusCode,
            }
          : {
              message: 'Success',
              statusCode: context.switchToHttp().getResponse().statusCode,
              data: data,
            },
      ),
    );
  }
}
