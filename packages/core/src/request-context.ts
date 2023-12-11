import { ApiDocument } from '@opra/common';
import { ExecutionContext } from './execution-context.js';
import type { Request } from './request.js';
import type { Response } from './response.js';

export interface RequestContext extends ExecutionContext {
  request: Request;
  response: Response;
  api: ApiDocument;
}

export namespace RequestContext {
  export function from(
      executionContext: ExecutionContext,
      api: ApiDocument,
      request: Request,
      response: Response
  ): RequestContext {
    const out = {
      api,
      request,
      response
    } as RequestContext;
    Object.setPrototypeOf(out, executionContext);
    return out;
  }

  export function is(v: any): v is RequestContext {
    return ExecutionContext.is(v) &&
        (v as any).api instanceof ApiDocument &&
        (v as any).request &&
        (v as any).response;
  }

}
