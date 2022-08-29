import type { SearchParams } from '@opra/url';
import type { HttpStatus } from '../enums';
import type { ApiException } from '../exception';
import type { HeadersObject } from '../helpers/headers';
import { Headers } from '../helpers/headers.js';
import type { ExecutionQuery } from './execution-query';
import type { OpraService } from './opra-service';
import type { Resource } from './resource/resource';

export type ExecutionContextArgs = Pick<ExecutionContext, 'service' | 'resource' |
    'request' | 'response' | 'userContext' | 'continueOnError'>;

export class ExecutionContext {
  readonly service: OpraService;
  readonly resource: Resource;
  readonly request: ExecutionRequest;
  readonly response: ExecutionResponse;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: ExecutionContextArgs) {
    Object.assign(this, args);
  }
}

export type ExecutionRequestArgs = Pick<ExecutionRequest, 'query' | 'params' | 'headers' |
    'parentValue' | 'resultPath'>

export class ExecutionRequest {
  readonly query: ExecutionQuery;
  readonly params: SearchParams;
  readonly headers: HeadersObject;
  readonly parentValue?: any;
  readonly resultPath: string;

  constructor(args: ExecutionRequestArgs) {
    Object.assign(this, args);
  }
}

export type ExecutionResponseArgs = Pick<ExecutionResponse, 'status' | 'value' | 'total'>

export class ExecutionResponse {
  headers: HeadersObject = Headers.create();
  errors: ApiException[] = [];
  status?: HttpStatus;
  value?: any;
  total?: number;

  constructor(args?: ExecutionResponseArgs) {
    if (args)
      Object.assign(this, args);
  }
}
