import { OpraURLSearchParams, SearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { ApiException } from '../exception/index.js';
import { ContextType, IAdapterContext, IHttpAdapterContext } from '../interfaces/adapter-context.interface.js';
import { OpraQuery } from '../interfaces/execution-query.interface.js';
import { Headers, HeadersObject } from '../utils/headers.js';
import { OpraService } from './opra-service.js';

export type QueryContextArgs = Pick<QueryContext,
    'service' | 'query' | 'parentValue' | 'headers' | 'params' |
    'adapterContext' | 'userContext' | 'continueOnError'>;

export class QueryContext {
  readonly service: OpraService;
  readonly query: OpraQuery;
  readonly params: SearchParams;
  readonly headers: HeadersObject;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly response: QueryResponse;
  readonly adapterContext: IAdapterContext;
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
    return this.adapterContext.getType();
  }

  switchToHttp(): IHttpAdapterContext {
    if (this.type !== 'http')
      throw new Error(`You can't access http context within an ${this.type} context`);
    return this.adapterContext as IHttpAdapterContext;
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
