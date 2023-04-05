/// <reference lib="dom" />
import { HttpHeaders, HttpParams, OpraURL, OpraURLPath, OpraURLSearchParams } from '@opra/common';

const directCopyProperties = ['cache', 'credentials', 'destination', 'headers', 'integrity',
  'keepalive', 'mode', 'redirect', 'referrer', 'referrerPolicy'];

export interface HttpRequestInit {
  cache?: RequestCache;
  credentials?: RequestCredentials;
  destination?: RequestDestination;
  headers?: HttpHeaders.Initiator;
  integrity?: string;
  keepalive?: boolean;
  method?: string;
  mode?: RequestMode;
  params?: HttpParams.Initiator;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  signal?: AbortSignal;
  url?: string;
  body?: any;
}

export class HttpRequest {
  /** Returns the cache mode associated with request, which is a string indicating
   * how the request will interact with the browser's cache when fetching. */
  cache: RequestCache;
  /** Returns the credentials mode associated with request, which is a string indicating
   * whether credentials will be sent with the request always, never,
   * or only when sent to a same-origin URL. */
  credentials: RequestCredentials;
  /** Returns the kind of resource requested by request, e.g., "document" or "script". */
  destination: RequestDestination;
  /** Returns a Headers object consisting of the headers associated with request.
   * Note that headers added in the network layer by the user agent will not be accounted for in this object,
   * e.g., the "Host" header. */
  headers: HttpHeaders;
  /** Returns request's subresource integrity metadata, which is a cryptographic
   * hash of the resource being fetched.
   * Its value consists of multiple hashes separated by whitespace. [SRI] */
  integrity: string;
  /** Returns a boolean indicating whether or not request can outlive the global in which it was created. */
  keepalive: boolean;
  /** Returns request's HTTP method, which is "GET" by default. */
  method: string;
  /** Returns the mode associated with request, which is a string indicating whether the request will use CORS,
   *  or will be restricted to same-origin URLs. */
  mode: RequestMode;
  /** Returns the redirect mode associated with request, which is a string indicating
   * how redirects for the request will be handled during fetching. A request will follow redirects by default. */
  redirect: RequestRedirect;
  /** Returns the referrer of request. Its value can be a same-origin URL if explicitly set in init,
   *  the empty string to indicate no referrer, and "about:client" when defaulting to the global's default.
   *  This is used during fetching to determine the value of the `Referer` header of the request being made. */
  referrer: string;
  /** Returns the referrer policy associated with request. This is used during fetching
   * to compute the value of the request's referrer. */
  referrerPolicy: ReferrerPolicy;
  /** Returns the signal associated with request, which is an AbortSignal object indicating
   *  whether or not request has been aborted, and its abort event handler. */
  signal?: AbortSignal;
  /** Returns the parsed url as OpraURL instance */
  readonly urlInstance: OpraURL;
  /** Body of the http request */
  body?: any;
  duplex?: 'half';

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
    this.signal = init?.signal || new AbortController().signal;
    this.body = init?.body;
    this.urlInstance = new OpraURL(init?.url);
    if (init?.params)
      this.params.appendAll(init.params);
  }

  /** Returns the URL of request as a string. */
  get url(): string {
    return this.urlInstance.href;
  }

  set url(value: string) {
    this.urlInstance.parse(value);
  }

  /** Returns the searchParams of the URL as OpraURLSearchParams */
  get params(): OpraURLSearchParams {
    return this.urlInstance.searchParams;
  }

  /** Returns the path part of URL as OpraURLPath */
  get path(): OpraURLPath {
    return this.urlInstance.path;
  }

  clone(...update: (HttpRequest | HttpRequestInit)[]): HttpRequest {
    const out = new HttpRequest();
    out.merge(this);
    for (const upd of update) {
      out.merge(upd);
    }
    return out;
  }

  merge(update: HttpRequest | HttpRequestInit) {
    directCopyProperties.forEach(k => {
      if (update[k] != null)
        this[k] = update[k];
    });
    if (update.headers) {
      const h = update.headers instanceof HttpHeaders
          ? update.headers
          : new HttpHeaders(update.headers);
      h.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') {
          this.headers.append(k, v);
        } else this.headers.set(k, v);
      });
    }
  }

  inset(src: HttpRequest | HttpRequestInit) {
    directCopyProperties.forEach(k => {
      if (this[k] == null && src[k] != null)
        this[k] = src[k];
    });
    if (src.headers) {
      const h = src.headers instanceof HttpHeaders
          ? src.headers
          : new HttpHeaders(src.headers);
      h.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') {
          this.headers.append(k, v);
        } else if (!this.headers.has(k))
          this.headers.set(k, v);
      });
    }
  }

}
