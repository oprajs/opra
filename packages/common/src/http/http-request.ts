/// <reference lib="dom" />

import { HttpHeaders, HttpHeadersInit } from './http-headers.js';

export interface HttpRequestInit {
  cache?: RequestCache;
  credentials?: RequestCredentials;
  destination?: RequestDestination;
  headers?: HttpHeadersInit;
  integrity?: string;
  keepalive?: boolean;
  method?: string;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal;
  url?: string;
}


export class HttpRequest {
  /** Returns the cache mode associated with request, which is a string indicating
   * how the request will interact with the browser's cache when fetching. */
  readonly cache: RequestCache;
  /** Returns the credentials mode associated with request, which is a string indicating
   * whether credentials will be sent with the request always, never,
   * or only when sent to a same-origin URL. */
  readonly credentials: RequestCredentials;
  /** Returns the kind of resource requested by request, e.g., "document" or "script". */
  readonly destination: RequestDestination;
  /** Returns a Headers object consisting of the headers associated with request.
   * Note that headers added in the network layer by the user agent will not be accounted for in this object,
   * e.g., the "Host" header. */
  readonly headers: HttpHeaders;
  /** Returns request's subresource integrity metadata, which is a cryptographic
   * hash of the resource being fetched.
   * Its value consists of multiple hashes separated by whitespace. [SRI] */
  readonly integrity: string ;
  /** Returns a boolean indicating whether or not request can outlive the global in which it was created. */
  readonly keepalive: boolean;
  /** Returns request's HTTP method, which is "GET" by default. */
  readonly method: string;
  /** Returns the mode associated with request, which is a string indicating whether the request will use CORS,
   *  or will be restricted to same-origin URLs. */
  readonly mode: RequestMode;
  /** Returns the redirect mode associated with request, which is a string indicating
   * how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  readonly redirect: RequestRedirect = 'follow';
  /** Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init,
   *  the empty string to indicate no referrer, and "about:client" when defaulting to the global's default.
   *  This is used during fetching to determine the value of the `Referer` header of the request being made. */
  readonly referrer: string;
  /** Returns the referrer policy associated with request. This is used during fetching
   * to compute the value of the request's referrer. */
  readonly referrerPolicy: ReferrerPolicy;
  /** Returns the signal associated with request, which is an AbortSignal object indicating
   *  whether or not request has been aborted, and its abort event handler. */
  readonly signal?: AbortSignal;
  /** Returns the URL of request as a string. */
  readonly url: string;

  constructor(init?: HttpRequestInit) {
    this.cache = init?.cache || 'default';
    this.credentials = init?.credentials || 'same-origin';
    this.destination = init?.destination || '';
    this.headers = new HttpHeaders(init?.headers);
    this.integrity = init?.integrity || '';
    this.keepalive = init?.keepalive ?? false;
    this.method = (init?.method || 'GET').toUpperCase();
    this.mode = init?.mode || 'cors';
    this.redirect = init?.redirect || 'follow';
    this.mode = init?.mode || 'cors';
    this.referrer = init?.referrer || '';
    this.referrerPolicy = init?.referrerPolicy || '';
    this.signal = init?.signal || new AbortSignal();
    this.url = init?.url || '';
  }

  clone(update?: HttpRequestInit): HttpRequest {
    return new HttpRequest({...this, ...update});
  }
}
