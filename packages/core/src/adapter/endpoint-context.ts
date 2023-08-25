import type { ExecutionContext } from './execution-context';
import type { Request } from './request';
import type { Response } from './response';

export interface EndpointContext<TSession extends {} = {}> extends ExecutionContext<TSession> {
  request: Request;
  response: Response;
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
      session: {}
    } as EndpointContext;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }
}
