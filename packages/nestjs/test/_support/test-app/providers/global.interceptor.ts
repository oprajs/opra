import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  static instanceCounter = 0;
  static callCounter = 0;

  constructor() {
    GlobalInterceptor.instanceCounter++;
  }

  intercept(context: ExecutionContext, call: CallHandler): Observable<any> {
    GlobalInterceptor.callCounter++;
    return call.handle();
  }
}
