import {
  ContextType,
  HttpExecutionContext,
  HttpRequestWrapper,
  HttpResponseWrapper,
} from '../interfaces/execution-context.interface.js';
import { ExecutionContextHost } from '../internal/execution-context.host.js';

export class HttpExecutionContextHost extends ExecutionContextHost implements HttpExecutionContext {

  constructor(
      protected readonly _platform: string,
      protected readonly _request: HttpRequestWrapper,
      protected readonly _response: HttpResponseWrapper) {
    super();
  }

  getType(): ContextType {
    return 'http';
  }

  getPlatform(): string {
    return this._platform;
  }

  getRequest(): HttpRequestWrapper {
    return this._request;
  }

  getResponse(): HttpResponseWrapper {
    return this._response;
  }

  switchToHttp(): HttpExecutionContext {
    return this;
  }

}
