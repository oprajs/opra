import { ApiDocument, HttpApi, OpraSchema } from '@opra/common';
import { PlatformAdapter } from '@opra/core';
import { HttpContext } from './http-context.js';
import { HttpHandler } from './http-handler.js';

export namespace HttpAdapter {
  export type NextCallback = () => Promise<void>;

  /**
   * @type InterceptorFunction
   */
  export type InterceptorFunction = IHttpInterceptor['intercept'];

  /**
   * @interface IHttpInterceptor
   */
  export type IHttpInterceptor = {
    intercept(context: HttpContext, next: NextCallback): Promise<void>;
  };

  export interface Options extends PlatformAdapter.Options {
    basePath?: string;
    interceptors?: (InterceptorFunction | IHttpInterceptor)[];
  }
}

/**
 *
 * @class HttpAdapter
 */
export abstract class HttpAdapter extends PlatformAdapter {
  readonly handler: HttpHandler;
  readonly protocol: OpraSchema.Transport = 'http';
  interceptors: (HttpAdapter.InterceptorFunction | HttpAdapter.IHttpInterceptor)[];

  protected constructor(document: ApiDocument, options?: HttpAdapter.Options) {
    super(document, options);
    if (!(document.api instanceof HttpApi)) throw new TypeError(`The document does not expose an HTTP Api`);
    this.handler = new HttpHandler(this);
    this.interceptors = [...(options?.interceptors || [])];
  }

  get api(): HttpApi {
    return this.document.httpApi;
  }
}
