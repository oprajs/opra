import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LogCounterInterceptor implements NestInterceptor {
  static logCount = 0;
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    LogCounterInterceptor.logCount++;
    return next.handle();
  }
}
