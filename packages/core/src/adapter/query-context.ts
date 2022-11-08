import { OpraException } from '@opra/exception';
import { OpraDocument, OpraQuery } from '@opra/schema';
import { OpraURLSearchParams } from '@opra/url';
import { HttpStatus } from '../enums/index.js';
import { HeadersMap } from '../helpers/headers-map.js';
import {
  ContextType,
  IExecutionContext,
  IHttpExecutionContext
} from '../interfaces/execution-context.interface.js';

export type QueryContextArgs = Pick<QueryContext,
    'service' | 'executionContext' | 'query' | 'params' | 'headers' |
    'userContext' | 'parentValue' | 'continueOnError'>;

export class QueryContext {
  readonly service: OpraDocument;
  readonly executionContext: IExecutionContext;
  readonly query: OpraQuery;
  readonly params: OpraURLSearchParams;
  readonly headers: HeadersMap;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly responseHeaders: HeadersMap;
  response?: any;
  errors: OpraException[] = [];
  status?: HttpStatus;
  userContext?: any;
  continueOnError?: boolean;

  constructor(args: QueryContextArgs) {
    // Object.assign(this, args);
    this.service = args.service;
    this.executionContext = args.executionContext;
    this.query = args.query;

    // this.response = new QueryResponse();
    this.params = this.params || new OpraURLSearchParams();
    this.headers = new HeadersMap(args.headers);
    this.responseHeaders = new HeadersMap();
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
