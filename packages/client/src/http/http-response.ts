import { HttpHeaders } from '@opra/common';

export namespace HttpResponse {
  export interface Initiator {
    headers?: HttpHeaders.Initiator;
    status?: number;
    statusText?: string;
    url?: string;
    body?: any;
    hasBody?: boolean;
    totalMatches?: number;
  }
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

  readonly totalMatches?: number;

  /**
   * Returns true if response has body to be received
   */
  readonly hasBody: boolean = false;

  constructor(init?: HttpResponse.Initiator) {
    this.headers = new HttpHeaders(init?.headers);
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.url = init?.url || null;
    this.ok = this.status >= 200 && this.status < 300;
    this.body = init?.body;
    this.hasBody = init?.body != null || !!init?.hasBody;
    this.totalMatches = init?.totalMatches;
  }

  clone(update?: HttpResponse.Initiator): HttpResponse {
    return new HttpResponse({...this, ...update});
  }

}
