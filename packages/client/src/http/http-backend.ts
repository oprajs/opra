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
    const u = new URL(serviceUrl);
    this.serviceUrl = u.toString().split('?')[0].split('#')[0];
    if (!this.serviceUrl.endsWith('/')) this.serviceUrl += '/';
  }
}

/**
 *
 * @namespace HttpBackend
 */
export namespace HttpBackend {
  export interface Options extends Backend.Options {}

  export interface RequestInit extends Backend.RequestInit {
    method: string;
    url: string | URL;
    headers?: Headers;
    body?: any;
  }
}
