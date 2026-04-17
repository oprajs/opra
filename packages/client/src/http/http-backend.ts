import { Backend } from '../core/backend.js';
import type { HttpHandler } from './interfaces/http-handler.js';
import type { HttpInterceptor } from './interfaces/http-interceptor.js';

/**
 * Base class for HTTP backends.
 *
 * @class HttpBackend
 */
export abstract class HttpBackend extends Backend implements HttpHandler {
  /** The base URL of the service */
  readonly serviceUrl: string;
  /** List of HTTP interceptors */
  interceptors?: HttpInterceptor<any>[];

  /**
   * Creates a new instance of HttpBackend.
   *
   * @param serviceUrl The base URL of the service.
   * @param options Configuration options.
   * @protected
   */
  protected constructor(serviceUrl: string, options?: HttpBackend.Options) {
    super(options);
    const u = new URL(serviceUrl);
    this.serviceUrl = u.toString().split('?')[0].split('#')[0];
    if (!this.serviceUrl.endsWith('/')) this.serviceUrl += '/';
  }
}

/**
 * Namespace for {@link HttpBackend} related types and interfaces.
 *
 * @namespace HttpBackend
 */
export namespace HttpBackend {
  /** Configuration options for HttpBackend */
  export interface Options extends Backend.Options {}

  /** Request initialization parameters for HttpBackend */
  export interface RequestInit extends Backend.RequestInit {
    /** HTTP method (GET, POST, etc.) */
    method: string;
    /** The target URL */
    url: string | URL;
    /** HTTP headers */
    headers?: Headers;
    /** Request body */
    body?: any;
  }
}
