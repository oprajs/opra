import { OpraURLSearchParams, SearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { ApiException } from '../exception/index.js';
import { ContextType, IAdapterContext, IHttpAdapterContext } from '../interfaces/adapter-context.interface.js';
import { ExecutionQuery } from '../interfaces/execution-query.interface.js';
import { Headers, HeadersObject } from '../utils/headers.js';
import { OpraService } from './opra-service.js';

export type ExecutionContextArgs = Pick<ExecutionContext,
    'service' | 'query' | 'parentValue' | 'headers' | 'params' |
    'adapterContext' | 'userContext' | 'continueOnError'>;

export class ExecutionContext {
  readonly service: OpraService;
  readonly query: ExecutionQuery;
  readonly params: SearchParams;
  readonly headers: HeadersObject;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly response: ExecutionResponse;
  readonly adapterContext: IAdapterContext;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: ExecutionContextArgs) {
    Object.assign(this, args);
    this.response = new ExecutionResponse();
    this.params = this.params || new OpraURLSearchParams();
    this.headers = this.headers || Headers.create();
    this.resultPath = this.resultPath || '';
  }

  get type(): ContextType {
    return this.adapterContext.getType();
  }

  switchToHttp(): IHttpAdapterContext {
    if (this.type !== 'http')
      throw new Error(`You can't access http context within an ${this.type} context`);
    return this.adapterContext as IHttpAdapterContext;
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
