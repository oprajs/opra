import { OpraURLSearchParams, SearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { ApiException } from '../exception/index.js';
import {
  ContextType,
  IExecutionContext,
  IHttpExecutionContext
} from '../interfaces/execution-context.interface.js';
import { OpraQuery } from '../interfaces/query.interface.js';
import { Headers, HeadersObject } from '../utils/headers.js';
import { OpraService } from './opra-service.js';

export type QueryContextArgs = Pick<QueryContext,
    'service' | 'executionContext' | 'query' | 'params' | 'headers' |
    'userContext' | 'parentValue' | 'continueOnError'>;

export class QueryContext {
  readonly service: OpraService;
  readonly executionContext: IExecutionContext;
  readonly query: OpraQuery;
  readonly params: SearchParams;
  readonly headers: HeadersObject;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly response: QueryResponse;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: QueryContextArgs) {
    Object.assign(this, args);
    this.response = new QueryResponse();
    this.params = this.params || new OpraURLSearchParams();
    this.headers = this.headers || Headers.create();
    this.resultPath = this.resultPath || '';
  }

  get type(): ContextType {
    return this.executionContext.getType();
  }

  switchToHttp(): IHttpExecutionContext {
    if (this.type !== 'http')
      throw new Error(`You can't access http context within an ${this.type} context`);
    return this.executionContext as IHttpExecutionContext;
  }
}

export type QueryResponseArgs = Pick<QueryResponse, 'status' | 'value' | 'total'>

export class QueryResponse {
  headers: HeadersObject = Headers.create();
  errors: ApiException[] = [];
  status?: HttpStatus;
  value?: any;
  total?: number;

  constructor(args?: QueryResponseArgs) {
    if (args)
      Object.assign(this, args);
  }
}
