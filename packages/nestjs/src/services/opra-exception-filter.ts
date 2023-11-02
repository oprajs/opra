import { Catch, ExceptionFilter } from '@nestjs/common';
import { OpraException } from '@opra/common';

@Catch(OpraException)
export class OpraExceptionFilter implements ExceptionFilter {
  catch(exception: any) {
    if (exception instanceof OpraException)
      return true;
    throw exception;
  }
}
