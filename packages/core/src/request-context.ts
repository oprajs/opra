import type { ExecutionContext } from './execution-context.js';
import type { Request } from './request.js';
import type { Response } from './response.js';

export interface RequestContext extends ExecutionContext {
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
      response
    } as RequestContext;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }
}
