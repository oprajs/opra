import { HttpHeaders, HttpHeadersInit } from './http-headers.js';

export interface HttpResponseInit {
  /**
   *  Contains the Headers object associated with the response.
   */
  headers?: HttpHeadersInit;

  /**
   * Contains the HTTP status codes of the response
   */
  status?: number;

  /**
   * Contains the status message corresponding to the HTTP status code in status property
   */
  statusText?: string;

  /**
   * Contains the URL of the response
   */
  url?: string;

  /**
   * Body contents
   */
  body?: any;
}

export class HttpResponse {
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
  readonly body: any | null;

  constructor(init?: HttpResponseInit) {
    this.headers = new HttpHeaders(init?.headers);
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.url = init?.url || null;
    this.ok = this.status >= 200 && this.status < 300;
  }

  clone(update?: HttpResponseInit): HttpResponse {
    return new HttpResponse({...this, ...update});
  }

}
