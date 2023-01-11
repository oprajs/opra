import { Observable } from 'rxjs';
import { ClientHttpHeaders, uid } from '@opra/common';
import { HttpResponse } from './http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from './http-types.js';

export abstract class HttpRequestBuilder<TResult = any, TResponse extends HttpResponse<TResult> = HttpResponse<TResult>>
    extends Observable<TResult | TResponse> {
  readonly contentId: string;
  protected _promise?: Promise<TResponse>;
  protected _headers?: ClientHttpHeaders;

  protected constructor(
      protected _handler: HttpRequestHandler<TResult>,
      public options: CommonHttpRequestOptions = {}
  ) {
    super((subscriber) => {
      if (options.observe === 'response') {
        this.fetch().then(v => {
          subscriber.next(v);
          subscriber.complete();
        }).catch(e => subscriber.error(e));
        return;
      }
      this.resolve().then(v => {
        subscriber.next(v);
        subscriber.complete();
      }).catch(e => subscriber.error(e));
    });
    this.contentId = uid(6);
    this.options = options;
  }

  abstract prepare(): RawHttpRequest;

  header<K extends keyof ClientHttpHeaders>(name: K, value: ClientHttpHeaders[K]): this {
    this._headers = this._headers || {};
    this._headers[name] = value;
    return this;
  }

  /**
   * Sends the request
   */
  async fetch(): Promise<TResponse> {
    const promise = this._promise || (this._promise = new Promise<TResponse>((resolve, reject) => {
      setTimeout(() => {
        this._execute().then(resolve).catch(reject);
      }, 0);
    }));
    return await promise;
  }

  /**
   * Sends the request and returns response data
   */
  async resolve(): Promise<TResult | undefined> {
    const resp = await this.fetch();
    return resp.data;
  }

  with(cb: (_this: this) => void): this {
    cb(this);
    return this;
  }

  binding(): any {
    return {};
  }

  protected async _execute(): Promise<TResponse> {
    const req = this.prepare();
    return await this._handler(req) as TResponse;
  }

}
