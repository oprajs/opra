import { OpraURL } from '@opra/common';
import { Backend } from '../core/backend.js';
import type { HttpHandler } from './interfaces/http-handler.js';
import type { HttpInterceptor } from './interfaces/http-interceptor.js';

/**
 *
 * @class HttpBackend
 */
export abstract class HttpBackend extends Backend implements HttpHandler {
  readonly serviceUrl: string;
  interceptors: HttpInterceptor<any>[];

  protected constructor(serviceUrl: string, options?: HttpBackend.Options) {
    super(options);
    this.serviceUrl = serviceUrl;
  }
}


/**
 *
 * @namespace HttpBackend
 */
export namespace HttpBackend {

  export interface Options extends Backend.Options {
  }

  export interface RequestInit extends Backend.RequestInit {
    method: string;
    url: string | URL | OpraURL;
    headers?: Headers;
    body?: any;
  }

}
