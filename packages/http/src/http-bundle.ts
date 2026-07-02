import { ExecutionBundle, ExecutionContext } from '@opra/core';
import type { HttpAdapter } from './http-adapter.js';
import { HttpContext } from './http-context.js';
import { MultipartReader } from './impl/multipart-reader.js';
import type { HttpRequest } from './interfaces/http-request.interface.js';
import type { HttpResponse } from './interfaces/http-response.interface.js';

export class HttpBundle extends ExecutionBundle {
  declare readonly __adapter: HttpAdapter;
  protected _multipartReader?: MultipartReader;
  readonly request: HttpRequest;
  readonly response: HttpResponse;
  readonly cookies: Record<string, any>;
  readonly headers: Record<string, any>;
  readonly pathParams: Record<string, any>;
  readonly queryParams: Record<string, any>;
  readonly contexts: HttpContext[] = [];

  constructor(init: HttpBundle.Initiator) {
    super({
      ...init,
      transport: 'http',
    });
    this.request = init.request;
    this.response = init.response;
    this.cookies = init.cookies || {};
    this.headers = init.headers || {};
    this.pathParams = init.pathParams || {};
    this.queryParams = init.queryParams || {};
    this.on('finish', () => {
      if (this._multipartReader)
        this._multipartReader.purge().catch(() => undefined);
    });
  }

  get size(): number {
    return this.contexts.length;
  }
}

export namespace HttpBundle {
  export interface Initiator extends Omit<
    ExecutionContext.Initiator,
    '__adapter' | '__docNode' | 'transport'
  > {
    __adapter: HttpAdapter;
    request: HttpRequest;
    response: HttpResponse;
    cookies?: Record<string, any>;
    headers?: Record<string, any>;
    pathParams?: Record<string, any>;
    queryParams?: Record<string, any>;
  }
}
