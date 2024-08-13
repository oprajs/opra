import { ArgumentsHost } from '@nestjs/common';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter.js';

const oldCatchMethod = ExternalExceptionFilter.prototype.catch;
ExternalExceptionFilter.prototype.catch = function (exception: any, host: ArgumentsHost) {
  const opraContext = host.getArgByIndex(3);
  // Prevents error logging for all Opra controllers
  if (opraContext && opraContext.request && opraContext.response) throw exception;
  oldCatchMethod(exception, host);
};
