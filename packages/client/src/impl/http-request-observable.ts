import { lastValueFrom, Observable } from 'rxjs';
import { isReadableStreamLike } from 'rxjs/internal/util/isReadableStreamLike';
import typeIs from 'type-is';
import { isBlob, OpraURL } from '@opra/common';
import type { OpraHttpClient } from '../client.js';
import { ClientError } from '../client-error.js';
import { kClient, kContext } from '../constants.js';
import { HttpObserveType } from '../enums/index.js';
import {
  HttpEvent,
  HttpEventType,
  HttpResponseEvent,
  HttpResponseHeaderEvent,
  HttpSentEvent
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
export class HttpRequestObservable<TPayload = any, TResponseExt = {}> extends Observable<TPayload> {
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

  observe(): Observable<TPayload>
  observe(observe: HttpObserveType.Body): Observable<any>
  observe(observe: HttpObserveType.ResponseHeader): Observable<HttpResponse<void> & TResponseExt>
  observe(observe: HttpObserveType.Response): Observable<HttpResponse<any> & TResponseExt>
  observe(observe: HttpObserveType.Events): Observable<HttpEvent>
  observe(observe?: HttpObserveType): Observable<any> {
    observe = observe || HttpObserveType.Body;
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

            if (event.event === HttpEventType.Response) {
              const {response} = event;
              const isOpraResponse = typeIs.is(event.response.contentType || '', ['application/opra+json']);
              if (observe === HttpObserveType.Response) {
                subscriber.next(response);
                subscriber.complete();
                return;
              }

              if (response.status >= 400 && response.status < 600) {
                subscriber.error(new ClientError({
                  message: response.status + ' ' + response.statusText,
                  status: response.status,
                  issues: isOpraResponse ? response.body.errors : undefined
                }));
                subscriber.complete();
                return;
              }

              subscriber.next(event.response.body);
              subscriber.complete();
            }
          },
          (error) => subscriber.error(error),
          () => subscriber.complete()
      )
    });
  }

  toPromise(): Promise<TPayload> {
    return this.getBody();
  }

  getBody(): Promise<TPayload> {
    return lastValueFrom(this.observe(HttpObserveType.Body));
  }

  getResponse(): Promise<HttpResponse<TPayload> & TResponseExt> {
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
        const contentType = (fetchResponse.headers.get('content-type') || '').split(';')[0];

        // Emit 'response-header' event
        const headersResponse = clientContext.createResponse({
          url: fetchResponse.url,
          headers: fetchResponse.headers,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          hasBody: !!fetchResponse.body,
          contentType
        })
        subscriber.next({
          request,
          event: HttpEventType.ResponseHeader,
          response: headersResponse
        } satisfies HttpResponseHeaderEvent);

        // Parse body
        const body: TPayload | undefined = fetchResponse.body
            ? await this._parseBody(fetchResponse)
            : undefined;

        // Create response
        const responseInit: HttpResponse.Initiator = {
          url: fetchResponse.url,
          headers: fetchResponse.headers,
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          contentType,
          body,
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

  protected async _parseBody(fetchResponse: Response): Promise<TPayload> {
    let body: any;
    const contentType = (fetchResponse.headers.get('Content-Type') || '');
    if (typeIs.is(contentType, ['json', 'application/*+json'])) {
      body = await fetchResponse.json();
      if (typeof body === 'string')
        body = JSON.parse(body);
    } else if (typeIs.is(contentType, ['text']))
      body = await fetchResponse.text();
    else if (typeIs.is(contentType, ['multipart']))
      body = await fetchResponse.formData();
    else {
      const buf = await fetchResponse.arrayBuffer();
      if (buf.byteLength)
        body = buf;
    }
    return body;
  }


}

