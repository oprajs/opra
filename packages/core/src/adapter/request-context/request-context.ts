import {
  ApiDocument,
  HttpHeaders,
  HttpParams,
  HttpStatusCodes,
  OpraException,
} from '@opra/common';
import { ContextType, ExecutionContext, HttpExecutionContext } from '../interfaces/execution-context.interface.js';

export type RequestContextArgs = Pick<RequestContext,
    'contentId' | 'document' | 'executionContext' |
    'parentValue' | 'continueOnError'> & {
  headers?: HttpHeaders.Initiator;
  params?: HttpParams.Initiator
};

export class RequestContext {
  readonly document: ApiDocument;
  readonly executionContext: ExecutionContext;
  readonly params: HttpParams;
  readonly headers: HttpHeaders;
  readonly contentId?: string;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly responseHeaders: HttpHeaders;
  response?: any;
  errors: OpraException[] = [];
  status?: HttpStatusCodes;
  continueOnError?: boolean;

  constructor(args: RequestContextArgs) {
    this.document = args.document;
    this.executionContext = args.executionContext;
    this.params = new HttpParams(args.params);
    this.headers = new HttpHeaders(args.headers);
    this.contentId = args.contentId;
    this.responseHeaders = new HttpHeaders();
    this.resultPath = this.resultPath || '';
  }

  get type(): ContextType {
    return this.executionContext.getType();
  }

  switchToHttp(): HttpExecutionContext {
    if (this.type !== 'http')
      throw new Error(`You can't access http context within an ${this.type} context only`);
    return this.executionContext as HttpExecutionContext;
  }
}
