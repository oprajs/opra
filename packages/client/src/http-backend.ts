import type { ApiDocument } from '@opra/common';
import { Observable } from 'rxjs';
import type { HttpEvent } from './interfaces/http-event.js';
import type { HttpHandler } from './interfaces/http-handler.js';
import type { HttpInterceptor } from './interfaces/http-interceptor.js';

/**
 * Base class for HTTP backends.
 *
 * @class HttpBackend
 */
export abstract class HttpBackend implements HttpHandler {
  /** The API document associated with this backend */
  document?: ApiDocument;
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
    this.document = options?.document;
    const u = new URL(serviceUrl);
    this.serviceUrl = u.toString().split('?')[0].split('#')[0];
    if (!this.serviceUrl.endsWith('/')) this.serviceUrl += '/';
  }

  /**
   * Handles the request and returns an observable of {@link HttpEvent}.
   *
   * @param init The request initialization parameters.
   * @returns An observable of HttpEvent.
   */
  abstract handle(init: HttpBackend.RequestInit): Observable<HttpEvent>;
}

/**
 * Namespace for {@link HttpBackend} related types and interfaces.
 *
 * @namespace HttpBackend
 */
export namespace HttpBackend {
  /** Configuration options for HttpBackend */
  export interface Options {
    /** The API document associated with this backend */
    document?: ApiDocument;
  }

  /** Request initialization parameters for HttpBackend */
  export interface RequestInit {
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
