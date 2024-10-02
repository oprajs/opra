import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TestInterceptor implements NestInterceptor {
  static instanceCounter = 0;
  static callCounter = 0;

  constructor() {
    TestInterceptor.instanceCounter++;
  }

  intercept(context: ExecutionContext, call: CallHandler): Observable<any> {
    TestInterceptor.callCounter++;
    return call.handle();
  }
}
