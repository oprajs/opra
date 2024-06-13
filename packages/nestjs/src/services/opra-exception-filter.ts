import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpOutgoing, wrapException } from '@opra/core';
import type { HttpHandler } from '@opra/core/src/http/impl/http-handler';
import { OpraNestAdapter } from './opra-nestjs-adapter.js';

export const kHandler = Symbol.for('kHandler');

export class OpraExceptionFilter implements ExceptionFilter {
  constructor(readonly adapter: OpraNestAdapter) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const _res = ctx.getResponse();
    const error = wrapException(exception);
    const response = HttpOutgoing.from(_res);
    return (this.adapter[kHandler] as HttpHandler).sendErrorResponse(response, [error]);
  }
}
