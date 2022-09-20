import { OpraURLSearchParams, SearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { ApiException } from '../exception/index.js';
import { ContextType, IHttpAdapterContext } from '../interfaces/adapter-context.interface.js';
import { ExecutionQuery } from '../interfaces/execution-query.interface.js';
import { Headers, HeadersObject } from '../utils/headers.js';
import { OpraService } from './opra-service.js';

export type ExecutionContextArgs = Pick<ExecutionContext,
    'type' | 'service' | 'request' | 'response' |
    'adapterContext' | 'userContext' | 'continueOnError'>;

export class ExecutionContext {
  readonly type: ContextType;
  readonly service: OpraService;
  readonly request: ExecutionRequest;
  readonly response: ExecutionResponse;
  readonly adapterContext: any;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: ExecutionContextArgs) {
    Object.assign(this, args);
  }

  switchToHttp(): IHttpAdapterContext {
    if (this.type !== 'http')
      throw new Error(`You can't access http context within an ${this.type} context`);
    return this.adapterContext;
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
