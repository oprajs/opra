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

  export type EventFunction = (context: HttpContext) => void | Promise<void>;

  export interface Events {
    createContext: EventFunction;
    error: EventFunction;
    request: EventFunction;
  }
}

export interface HttpAdapter {
  addListener<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  on<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  once(event: string | symbol, listener: (...args: any[]) => void): this;

  removeListener<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  removeListener(event: string | symbol, listener: (...args: any[]) => void): this;

  off<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  off(event: string | symbol, listener: (...args: any[]) => void): this;

  prependListener<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

  prependOnceListener<Event extends keyof HttpAdapter.Events>(event: Event, listener: HttpAdapter.Events[Event]): this;

  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

/**
 *
 * @class HttpAdapter
 */
export abstract class HttpAdapter extends PlatformAdapter {
  readonly handler: HttpHandler;
  readonly protocol: OpraSchema.Protocol = 'http';
  interceptors: (HttpAdapter.InterceptorFunction | HttpAdapter.IHttpInterceptor)[];

  protected constructor(document: ApiDocument, options?: HttpAdapter.Options) {
    super(document, options);
    if (!(document.api instanceof HttpApi)) throw new TypeError(`The document does not expose an HTTP Api`);
    this.handler = new HttpHandler(this);
    this.interceptors = [...(options?.interceptors || [])];
  }

  get api(): HttpApi {
    return this.document.api!;
  }
}
