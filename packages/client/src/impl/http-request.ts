/// <reference lib="dom" />
import { OpraURL } from '@opra/common';

/**
 * @namespace HttpRequest
 */
export namespace HttpRequest {
  export interface Initiator {
    cache?: RequestCache;
    credentials?: RequestCredentials;
    destination?: RequestDestination;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal;
    url: string | URL | OpraURL;
    body?: any;
  }
}

/**
 * @class HttpRequest
 */
export class HttpRequest {
  /** The url for request */
  url: OpraURL;

  /** Body of the http request */
  body?: any;
  /** The cache mode associated with request, which is a string indicating
   * how the request will interact with the browser's cache when fetching. */
  cache: RequestCache;
  /** The credentials mode associated with request, which is a string indicating
   * whether credentials will be sent with the request always, never,
   * or only when sent to a same-origin URL. */
  credentials: RequestCredentials;
  /** The kind of resource requested by request, e.g., "document" or "script". */
  destination: RequestDestination;
  /** Headers object consisting of the headers associated with request.
   * Note that headers added in the network layer by the user agent will not be accounted for in this object,
   * e.g., the "Host" header. */
  headers: Headers;
  /** Request's subresource integrity metadata, which is a cryptographic
   * hash of the resource being fetched.
   * Its value consists of multiple hashes separated by whitespace. [SRI] */
  integrity: string;
  /** A boolean indicating whether or not request can outlive the global in which it was created. */
  keepalive: boolean;
  /** Request's HTTP method, which is "GET" by default. */
  method: string;
  /** The mode associated with request, which is a string indicating whether the request will use CORS,
   *  or will be restricted to same-origin URLs. */
  mode: RequestMode;
  /** The redirect mode associated with request, which is a string indicating
   * how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  redirect: RequestRedirect;
  /** The referrer of request. Its value can be a same-origin URL if explicitly set in init,
   *  the empty string to indicate no referrer, and "about:client" when defaulting to the global's default.
   *  This is used during fetching to determine the value of the `Referer` header of the request being made. */
  referrer: string;
  /** The referrer policy associated with request. This is used during fetching
   * to compute the value of the request's referrer. */
  referrerPolicy: ReferrerPolicy;
  /** The signal associated with request, which is an AbortSignal object indicating
   *  whether or not request has been aborted, and its abort event handler. */
  signal?: AbortSignal;
  duplex?: 'half';

  constructor(init?: HttpRequest.Initiator) {
    this.cache = init?.cache || 'default';
    this.credentials = init?.credentials || 'same-origin';
    this.destination = init?.destination || '';
    this.integrity = init?.integrity || '';
    this.keepalive = init?.keepalive ?? false;
    this.method = (init?.method || 'GET').toUpperCase();
    this.mode = init?.mode || 'cors';
    this.redirect = init?.redirect || 'follow';
    this.referrer = init?.referrer || '';
    this.referrerPolicy = init?.referrerPolicy || '';
    this.signal = init?.signal || new AbortController().signal;
    this.body = init?.body;
    this.url = init?.url instanceof OpraURL ? init.url : new OpraURL(init?.url);
    this.headers = init?.headers instanceof Headers ? init.headers : new Headers(init?.headers);
  }

}
