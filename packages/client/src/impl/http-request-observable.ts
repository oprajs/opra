import { lastValueFrom, Observable } from 'rxjs';
import { isReadableStreamLike } from 'rxjs/internal/util/isReadableStreamLike';
import { isBlob, OpraURL } from '@opra/common';
import type { OpraHttpClient } from '../client.js';
import { ClientError } from '../client-error.js';
import {
  FORMDATA_CONTENT_TYPE_PATTERN,
  JSON_CONTENT_TYPE_PATTERN,
  kClient, kContext,
  OPRA_JSON_CONTENT_TYPE_PATTERN,
  TEXT_CONTENT_TYPE_PATTERN
} from '../constants.js';
import { HttpObserveType } from '../enums/index.js';
import {
  HttpEvent, HttpEventType, HttpResponseEvent,
  HttpResponseHeaderEvent, HttpSentEvent
} from '../interfaces/index.js';
import { RequestInterceptor, ResponseInterceptor, URLSearchParamsInit } from '../types.js';
import { HttpRequest } from './http-request.js';
import { HttpResponse } from './http-response.js';


const directCopyProperties = ['cache', 'credentials', 'destination', 'headers', 'integrity',
  'keepalive', 'mode', 'redirect', 'referrer', 'referrerPolicy'];

/**
 * @namespace HttpRequestObservable
 */
export namespace HttpRequestObservable {
  export interface Initiator extends HttpRequest.Initiator {
    requestInterceptors?: RequestInterceptor[];
    responseInterceptors?: ResponseInterceptor[];
  }

  export interface HttpOptions extends Partial<Pick<HttpRequest, 'cache' | 'credentials' |
      'destination' | 'integrity' | 'keepalive' | 'mode' | 'redirect' |
      'referrer' | 'referrerPolicy'>> {
  }

}

const kIntlObservable = Symbol.for('kIntlObservable');

/**
 * @class HttpRequestObservable
 */
export class HttpRequestObservable<TBody = any, TResponseExt = {}> extends Observable<TBody> {
  [kClient]: OpraHttpClient;
  [kIntlObservable]: Observable<HttpEvent>;
  request: HttpRequest;

  constructor(
      client: OpraHttpClient<any>,
      init?: HttpRequestObservable.Initiator
  ) {
    super((subscriber) => {
      this[kIntlObservable].subscribe((event) => {
            if (event.event === HttpEventType.Response) {
              subscriber.next(event.response.body);
              subscriber.complete();
            }
          },
          (error) => subscriber.error(error),
          () => subscriber.complete()
      )
    });
    Object.defineProperty(this, kClient, {
      enumerable: false,
      value: client
    })
    this.request = new HttpRequest(init);
    if (init?.headers)
      this.header(init.headers);
    this[kIntlObservable] = this._send();
  }

  httpOptions(options: HttpRequestObservable.HttpOptions): this {
    directCopyProperties.forEach(k => {
      if (options[k] !== undefined)
        this.request[k] = options[k];
    });
    return this;
  }

  header(headers: HeadersInit): this
  header(name: string, value?: string | number | boolean | null): this
  header(arg0: string | HeadersInit, value?: string | number | boolean | null): this {
    const headers = this.request.headers;
    if (typeof arg0 === 'object') {
      const h = arg0 instanceof Headers
          ? arg0
          : new Headers(arg0);
      h.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') {
          headers.append(k, v);
        } else headers.set(k, v);
      });
      return this;
    }
    if (value == null)
      headers.delete(arg0)
    else
      headers.append(arg0, String(value));
    return this;
  }

  param(params: URLSearchParamsInit): this
  param(name: string, value: any): this
  param(arg0: string | URLSearchParamsInit, value?: any): this {
    const params = this.request.url.searchParams;
    if (typeof arg0 === 'object') {
      const h = arg0 instanceof URLSearchParams
          ? arg0
          : new URLSearchParams(arg0);
      h.forEach((v, k) => params.set(k, v));
      return this;
    }
    if (value == null)
      params.delete(arg0)
    else
      params.set(arg0, String(value));
    return this;
  }

  observe(observe: HttpObserveType.Body): Observable<TBody>
  observe(observe: HttpObserveType.ResponseHeader): Observable<HttpResponse<void> & TResponseExt>
  observe(observe: HttpObserveType.Response): Observable<HttpResponse<TBody> & TResponseExt>
  observe(observe: HttpObserveType.Events): Observable<HttpEvent>
  observe(observe?: HttpObserveType): Observable<any> {
    return new Observable<any>((subscriber) => {
      this[kIntlObservable].subscribe((event) => {
            if (observe === HttpObserveType.Events) {
              subscriber.next(event);
              return;
            }
            if (observe === HttpObserveType.ResponseHeader && event.event === HttpEventType.ResponseHeader) {
              subscriber.next(event.response);
              subscriber.complete();
              return;
            }
            if (observe === HttpObserveType.Body && event.event === HttpEventType.Response) {
              subscriber.next(event.response.body);
              subscriber.complete();
              return;
            }
            if (event.event === HttpEventType.Response) {
              subscriber.next(event.response);
              subscriber.complete();
            }
          },
          (error) => subscriber.error(error),
          () => subscriber.complete()
      )
    });
  }

  toPromise(): Promise<TBody> {
    return this.getData();
  }

  getData(): Promise<TBody> {
    return lastValueFrom(this.observe(HttpObserveType.Body));
  }

  getResponse(): Promise<HttpResponse<TBody> & TResponseExt> {
    return lastValueFrom(this.observe(HttpObserveType.Response));
  }

  protected _send(): Observable<HttpEvent> {
    const request = this.request;
    const clientContext = this[kClient][kContext];
    return new Observable(subscriber => {
      (async () => {
        // Prepare request
        this._prepareRequest();

        // Call request Interceptors
        for (const interceptor of clientContext.requestInterceptors) {
          await interceptor(request);
        }

        // Emit 'sent' event
        subscriber.next({
          request,
          event: HttpEventType.Sent,
        } satisfies HttpSentEvent);

        // Send request
        const url = new OpraURL(request.url, clientContext.serviceUrl);
        const fetchResponse = await clientContext.fetch(url.toString(), request);

        // Emit 'response-header' event
        const headersResponse = clientContext.createResponse({
          url: fetchResponse.url,
          headers: fetchResponse.headers,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          hasBody: !!fetchResponse.body
        })
        subscriber.next({
          request,
          event: HttpEventType.ResponseHeader,
          response: headersResponse
        } satisfies HttpResponseHeaderEvent);

        // Parse body
        const body: TBody | undefined = fetchResponse.body
            ? await this._parseBody(fetchResponse)
            : undefined;

        // Handle errors
        if (fetchResponse.status >= 400 && fetchResponse.status <= 599) {
          subscriber.error(new ClientError({
            message: fetchResponse.status + ' ' + fetchResponse.statusText,
            status: fetchResponse.status,
            issues: (body as any).errors
          }));
          subscriber.complete();
          return;
        }

        // Create response
        const contentType = fetchResponse.headers.get('Content-Type') || '';
        const responseInit: HttpResponse.Initiator = {
          url: fetchResponse.url,
          headers: fetchResponse.headers,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          body,
        }
        if (OPRA_JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
          responseInit.totalCount = (body as any)?.totalCount;
          responseInit.affected = (body as any)?.affected;
        }
        const response = clientContext.createResponse(responseInit);

        // Call response Interceptors
        for (const interceptor of clientContext.responseInterceptors) {
          await interceptor(response);
        }

        // Emit 'response' event
        subscriber.next({
          request,
          event: HttpEventType.Response,
          response
        } satisfies HttpResponseEvent);

        subscriber.complete();

      })().catch(error => subscriber.error(error))
    });
  }

  protected _prepareRequest() {
    const request = this.request;
    if (request.body) {
      let body: any;
      let contentType: string;
      if (typeof request.body === 'string' || typeof request.body === 'number' || typeof request.body === 'boolean') {
        contentType = 'text/plain;charset=UTF-8"';
        body = String(request.body);
        request.headers.delete('Content-Size');
        delete request.duplex;
      } else if (isReadableStreamLike(request.body)) {
        contentType = 'application/octet-stream';
        body = request.body;
        request.duplex = 'half';
      } else if (Buffer.isBuffer(request.body)) {
        contentType = 'application/octet-stream';
        body = request.body;
        request.headers.set('Content-Size', String(request.body.length));
        delete request.duplex;
      } else if (isBlob(request.body)) {
        contentType = request.body.type || 'application/octet-stream';
        body = request.body;
        request.headers.set('Content-Size', String(request.body.length));
        delete request.duplex;
      } else {
        contentType = 'application/json';
        body = JSON.stringify(request.body);
        request.headers.delete('Content-Size');
        delete request.duplex;
      }
      if (!request.headers.has('Content-Type') && contentType)
        request.headers.set('Content-Type', contentType);
      request.body = body;
    }
  }

  protected async _parseBody(fetchResponse: Response): Promise<TBody> {
    let body: any;
    const contentType = fetchResponse.headers.get('Content-Type') || '';
    if (JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
      body = await fetchResponse.json();
      if (typeof body === 'string')
        body = JSON.parse(body);
    } else if (TEXT_CONTENT_TYPE_PATTERN.test(contentType))
      body = await fetchResponse.text();
    else if (FORMDATA_CONTENT_TYPE_PATTERN.test(contentType))
      body = await fetchResponse.formData();
    else {
      const buf = await fetchResponse.arrayBuffer();
      if (buf.byteLength)
        body = buf;
    }
    return body;
  }


}

