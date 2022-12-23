import {
  ContextType,
  IHttpExecutionContext,
  IHttpRequestWrapper,
  IHttpResponseWrapper,
} from '../../interfaces/execution-context.interface.js';
import { ExecutionContextHost } from './execution-context.host.js';

export class HttpExecutionContextHost extends ExecutionContextHost implements IHttpExecutionContext {

  constructor(
      protected readonly _platform: string,
      protected readonly _request: IHttpRequestWrapper,
      protected readonly _response: IHttpResponseWrapper) {
    super();
  }

  getType(): ContextType {
    return 'http';
  }

  getPlatform(): string {
    return this._platform;
  }

  getRequest(): IHttpRequestWrapper {
    return this._request;
  }

  getResponse(): IHttpResponseWrapper {
    return this._response;
  }

  switchToHttp(): IHttpExecutionContext {
    return this;
  }

}
