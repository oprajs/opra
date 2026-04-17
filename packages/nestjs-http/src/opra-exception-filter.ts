import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter, ModuleRef } from '@nestjs/core';
import { OpraHttpNestjsAdapter } from './opra-http-nestjs-adapter.js';

/**
 * OpraExceptionFilter
 *
 * NestJS exception filter that catches errors during OPRA HTTP requests
 * and returns responses according to OPRA standards.
 */
@Catch()
export class OpraExceptionFilter extends BaseExceptionFilter {
  constructor(private moduleRef: ModuleRef) {
    super();
  }

  /**
   * Processes the caught exception.
   * If the request has an OPRA context, it responds by converting the error to the OPRA error format.
   * Otherwise, it uses the default NestJS exception handling mechanism.
   *
   * @param exception - The caught exception object.
   * @param host - The arguments host.
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp().getRequest().opraContext;
    if (ctx) {
      const adapter = this.moduleRef.get(OpraHttpNestjsAdapter);
      ctx.errors.push(exception);
      return adapter.handler.sendResponse(ctx);
    }
    super.catch(exception, host);
  }
}
