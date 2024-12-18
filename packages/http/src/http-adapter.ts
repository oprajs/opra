import { HttpApi, OpraSchema } from '@opra/common';
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
    scope?: string;
  }
}

/**
 *
 * @class HttpAdapter
 */
export abstract class HttpAdapter extends PlatformAdapter {
  readonly handler: HttpHandler;
  readonly protocol: OpraSchema.Transport = 'http';
  readonly basePath: string;
  scope?: string;
  interceptors: (
    | HttpAdapter.InterceptorFunction
    | HttpAdapter.IHttpInterceptor
  )[];

  protected constructor(options?: HttpAdapter.Options) {
    super(options);
    this.handler = new HttpHandler(this);
    this.interceptors = [...(options?.interceptors || [])];
    this.basePath = options?.basePath || '/';
    if (!this.basePath.startsWith('/')) this.basePath = '/' + this.basePath;
    this.scope = options?.scope;
  }

  get api(): HttpApi {
    return this.document.httpApi;
  }
}
