import { HttpHeaders, HttpHeadersInit } from './http-headers.js';

export interface HttpResponseInit {
  headers?: HttpHeadersInit;
  status?: number;
  statusText?: string;
  url?: string;
  body?: any;
  hasBody?: boolean;
}

export class HttpResponse<TBody = any> {
  /**
   *  Contains the Headers object associated with the response.
   */
  readonly headers: HttpHeaders;
  /**
   *  Contains a Boolean stating whether the response was successful (status in the range 200-299) or not.
   */
  readonly ok: boolean;
  /**
   * Contains the HTTP status codes of the response
   */
  readonly status: number;
  /**
   * Contains the status message corresponding to the HTTP status code in status property
   */
  readonly statusText: string;
  /**
   * Contains the URL of the response
   */
  readonly url: string | null;
  /**
   * Body contents
   */
  readonly body: TBody | null;

  /**
   * Returns true if response has body to be received
   */
  readonly hasBody: boolean = false;

  constructor(init?: HttpResponseInit) {
    this.headers = new HttpHeaders(init?.headers);
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.url = init?.url || null;
    this.ok = this.status >= 200 && this.status < 300;
    this.body = init?.body;
    this.hasBody = init?.body != null || !!init?.hasBody;
  }

  clone(update?: HttpResponseInit): HttpResponse {
    return new HttpResponse({...this, ...update});
  }

}
