import { ApiDocument, HttpApi, OpraException, OpraSchema } from '@opra/common';
import { PlatformAdapter } from '../platform-adapter.js';
import { HttpContext } from './http-context.js';
import { HttpHandler } from './http-handler.js';

export namespace HttpAdapter {
  /**
   * @type Interceptor
   */
  export type Interceptor = (context: HttpContext, next: () => Promise<void>) => Promise<void>;

  export interface Options extends PlatformAdapter.Options {
    basePath?: string;
    interceptors?: HttpAdapter.Interceptor[];
  }

  export interface Events {
    error: (context: HttpContext) => void | Promise<void>;
    request: (context: HttpContext) => void | Promise<void>;
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
  interceptors: HttpAdapter.Interceptor[];

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
