import type { ExecutionContext } from './execution-context.js';
import type { Request } from './request.js';
import type { Response } from './response.js';

export interface RequestContext<TSession extends {} = {}> extends ExecutionContext<TSession> {
  request: Request;
  response: Response;
}

export namespace RequestContext {
  export function from(
      executionContext: ExecutionContext,
      request: Request,
      response: Response
  ): RequestContext {
    const out = {
      request,
      response,
      session: {}
    } as RequestContext;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }
}
