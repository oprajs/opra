import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export function Request() {
  return createParamDecorator((data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.opraRequest;
  })();
}

