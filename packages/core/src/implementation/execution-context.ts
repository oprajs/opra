import { OpraURLSearchParams, SearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { ApiException } from '../exception/index.js';
import { Headers, HeadersObject } from '../helpers/headers.js';
import { ExecutionQuery } from '../interfaces/execution-query.interface.js';
import { OpraService } from './opra-service.js';

export type ExecutionContextArgs = Pick<ExecutionContext, 'service' |
    'request' | 'response' | 'userContext' | 'continueOnError'>;

export class ExecutionContext {
  readonly service: OpraService;
  readonly request: ExecutionRequest;
  readonly response: ExecutionResponse;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: ExecutionContextArgs) {
    Object.assign(this, args);
  }
}

export type ExecutionRequestArgs = Pick<ExecutionRequest, 'query' | 'parentValue'> & {
  params?: SearchParams;
  headers?: HeadersObject;
  resultPath?: string;
}

export class ExecutionRequest {
  readonly query: ExecutionQuery;
  readonly params: SearchParams;
  readonly headers: HeadersObject;
  readonly parentValue?: any;
  readonly resultPath: string;

  constructor(args: ExecutionRequestArgs) {
    Object.assign(this, args);
    this.params = this.params || new OpraURLSearchParams();
    this.headers = this.headers || Headers.create();
    this.resultPath = this.resultPath || '';
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
