import { Observable } from 'rxjs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class LogCounterInterceptor implements NestInterceptor {
  static logCount = 0;
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    LogCounterInterceptor.logCount++;
    return next.handle();
  }
}
