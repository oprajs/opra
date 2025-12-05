import { HttpApi, OpraSchema } from '@opra/common';
import { PlatformAdapter } from '@opra/core';
import { EventMap } from 'node-events-async';
import { HttpContext } from './http-context.js';
import { HttpHandler } from './http-handler.js';

/**
 *
 * @class HttpAdapter
 */
export abstract class HttpAdapter<
  T extends HttpAdapter.Events = HttpAdapter.Events,
> extends PlatformAdapter<EventMap<T>> {
  readonly handler: HttpHandler;
  readonly transform: OpraSchema.Transport = 'http';
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
    return this.document.getHttpApi();
  }
}

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
    scope?: string | '*';
  }

  export interface Events {
    createContext: [HttpContext];
    error: [Error, HttpContext];
    request: [HttpContext];
    finish: [HttpContext];
  }
}
