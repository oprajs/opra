import { IncomingHttpHeaders } from 'http';
import { HttpStatusCodes, OpraDocument, OpraException, OpraURLSearchParams } from '@opra/common';
import {
  ContextType,
  IExecutionContext,
  IHttpExecutionContext
} from '../../interfaces/execution-context.interface.js';

export type RequestContextArgs = Pick<RequestContext,
    'contentId' | 'service' | 'executionContext' | 'params' | 'headers' |
    'parentValue' | 'continueOnError'>;

export class RequestContext {
  readonly service: OpraDocument;
  readonly executionContext: IExecutionContext;
  readonly params: OpraURLSearchParams;
  readonly headers: IncomingHttpHeaders;
  readonly contentId?: string;
  readonly parentValue?: any;
  readonly resultPath: string;
  readonly responseHeaders: IncomingHttpHeaders;
  response?: any;
  errors: OpraException[] = [];
  status?: HttpStatusCodes;
  continueOnError?: boolean;

  constructor(args: RequestContextArgs) {
    this.service = args.service;
    this.executionContext = args.executionContext;
    this.params = this.params || new OpraURLSearchParams();
    this.headers = args.headers;
    this.contentId = args.contentId;
    this.responseHeaders = {};
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
