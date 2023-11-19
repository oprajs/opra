import { ApiDocument } from '@opra/common';
import type { ExecutionContext } from './execution-context.js';
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
}
