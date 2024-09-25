import { type ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter, ModuleRef } from '@nestjs/core';
import { OpraHttpNestjsAdapter } from '../opra-http-nestjs-adapter.js';

@Catch()
export class OpraExceptionFilter extends BaseExceptionFilter {
  constructor(private moduleRef: ModuleRef) {
    super();
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp().getRequest().opraContext;
    if (ctx) {
      const adapter = this.moduleRef.get(OpraHttpNestjsAdapter);
      ctx.errors.push(exception);
      return adapter.handler.sendResponse(ctx);
    }
  }
}
