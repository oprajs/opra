import type { ExecutionContext } from './execution-context';
import type { Request } from './request';
import type { Response } from './response';

export interface EndpointContext<TRequest extends Request = Request, TResponse extends Response = Response> extends ExecutionContext {
  request: TRequest;
  response: TResponse;
  requestScope: Record<string | number | symbol, any>;
}

export namespace EndpointContext {
  export function from<TRequest extends Request = Request, TResponse extends Response = Response>(
      executionContext: ExecutionContext, request: TRequest, response: TResponse
  ): EndpointContext {
    const out = {
      request,
      response,
      requestScope: {}
    } as EndpointContext<TRequest, TResponse>;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }
}
