import { ArgumentsHost } from '@nestjs/common';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter';
import { OpraException } from '@opra/common';

const oldCatchMethod = ExternalExceptionFilter.prototype.catch;
ExternalExceptionFilter.prototype.catch = function (exception: any, host: ArgumentsHost) {
  // This prevents logging OpraException s
  if (exception instanceof OpraException)
    throw exception;
  oldCatchMethod(exception, host);
}
