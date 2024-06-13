import { ApiDocument, HttpApi, OpraSchema } from '@opra/common';
import { kHandler } from '../constants.js';
import { PlatformAdapter } from '../platform-adapter.js';
import { HttpContext } from './http-context.js';
import { HttpHandler } from './impl/http-handler.js';

export namespace HttpAdapter {
  /**
   * @type Interceptor
   */
  export type Interceptor = (context: HttpContext, next: () => Promise<void>) => Promise<void>;

  export interface Options extends PlatformAdapter.Options {
    basePath?: string;
    interceptors?: HttpAdapter.Interceptor[];
    onRequest?: (ctx: HttpContext) => void | Promise<void>;
  }
}

/**
 *
 * @class HttpAdapter
 */
export abstract class HttpAdapter extends PlatformAdapter {
  protected [kHandler]: HttpHandler;
  readonly protocol: OpraSchema.Protocol = 'http';
  interceptors: HttpAdapter.Interceptor[];

  protected constructor(document: ApiDocument, options?: HttpAdapter.Options) {
    super(document, options);
    if (!(document.api instanceof HttpApi)) throw new TypeError(`The document does not expose an HTTP Api`);
    this[kHandler] = new HttpHandler(this);
    this.interceptors = [...(options?.interceptors || [])];
    if (options?.onRequest) this.on('request', options.onRequest);
  }

  get api(): HttpApi {
    return this.document.api!;
  }
}
