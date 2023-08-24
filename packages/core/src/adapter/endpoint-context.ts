import type { ExecutionContext } from './execution-context';
import type { Request } from './request';
import type { Response } from './response';

export interface EndpointContext<TSpace extends object = Record<string | number | symbol, any>> extends ExecutionContext {
  request: Request;
  response: Response;
  space: TSpace;
}

export namespace EndpointContext {
  export function from(
      executionContext: ExecutionContext,
      request: Request,
      response: Response
  ): EndpointContext {
    const out = {
      request,
      response,
      space: {}
    } as EndpointContext;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }
}
