import typeIs from '@browsery/type-is';
import { MimeTypes, type URLSearchParamsInit } from '@opra/common';
import { lastValueFrom, Observable } from 'rxjs';
import { kBackend, kContext } from '../constants.js';
import { ClientError } from '../core/client-error.js';
import { HttpObserveType } from './enums/http-observable-type.enum.js';
import { HttpBackend } from './http-backend.js';
import { HttpInterceptorHandler } from './http-interceptor-handler.js';
import { HttpResponse } from './http-response.js';
import { type HttpEvent, HttpEventType } from './interfaces/http-event.js';

/**
 *
 * @class HttpRequestObservable
 */
export class HttpRequestObservable<
  /* Determines type of observable value */
  T,
  /* Determines type of body */
  TBody = T,
  /* Determines type of http request options */
  TRequestOptions = {},
  /* Determines type of object which extending HttpResponse */
  TResponseExt = {},
> extends Observable<T> {
  declare [kBackend]: HttpBackend;
  declare [kContext]: {
    observe: HttpObserveType;
    method: string;
    url: URL;
    headers: Headers;
    [key: string]: any;
  };

  constructor(backend: HttpBackend, init?: HttpBackend.RequestInit) {
    super(subscriber => {
      const observe = this[kContext].observe;
      new HttpInterceptorHandler(backend.interceptors || [], this[kBackend]).handle(this[kContext]).subscribe({
        next(event) {
          if (observe === HttpObserveType.Events) {
            subscriber.next(event as T);
            return;
          }

          if (observe === HttpObserveType.ResponseHeader && event.type === HttpEventType.ResponseHeader) {
            subscriber.next(event.response as T);
            subscriber.complete();
            return;
          }

          if (event.type === HttpEventType.Response) {
            const { response } = event;

            if (observe === HttpObserveType.Response) {
              subscriber.next(response as T);
              subscriber.complete();
              return;
            }

            const isOpraResponse = typeIs.is(event.response.contentType || '', [MimeTypes.opra_response_json]);

            if (response.status >= 400 && response.status < 600) {
              subscriber.error(
                new ClientError({
                  message: response.status + ' ' + response.statusText,
                  status: response.status,
                  issues: isOpraResponse ? response.body.errors : undefined,
                }),
              );
              subscriber.complete();
              return;
            }

            subscriber.next(event.response.body);
            subscriber.complete();
          }
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
    Object.defineProperty(this, kBackend, {
      enumerable: false,
      value: backend,
    });
    Object.defineProperty(this, kContext, {
      enumerable: false,
      value: {
        ...init,
        observe: HttpObserveType.Body,
        headers: new Headers(init?.headers),
      },
    });
  }

  clone() {
    return new HttpRequestObservable<T, TBody, TRequestOptions, TResponseExt>(this[kBackend], this[kContext]);
  }

  options(options: TRequestOptions): HttpRequestObservable<T, TBody, TRequestOptions, TResponseExt> {
    Object.assign(this[kContext], options);
    return this;
  }

  header(headers: HeadersInit): this;
  header(name: string, value?: string | number | boolean | null): this;
  header(arg0: string | HeadersInit, value?: string | number | boolean | null): this {
    const target = this[kContext].headers;
    if (typeof arg0 === 'object') {
      const h = arg0 instanceof Headers ? arg0 : new Headers(arg0);
      h.forEach((v, k) => {
        if (k.toLowerCase() === 'set-cookie') {
          target.append(k, v);
        } else target.set(k, v);
      });
      return this;
    }
    if (value == null || value === '') target.delete(arg0);
    else target.append(arg0, String(value));
    return this;
  }

  param(params: URLSearchParamsInit | Record<string, string | number | boolean | Date>): this;
  param(name: string, value: any): this;
  param(arg0: string | URLSearchParamsInit, value?: any): this {
    if (value && typeof value === 'object') {
      value = JSON.stringify(value);
    }
    const target = this[kContext].url.searchParams;
    if (typeof arg0 === 'object') {
      if (typeof arg0.forEach === 'function') {
        arg0.forEach((v: any, k: any) => target.set(String(k), String(v)));
      } else {
        Object.entries(arg0).forEach(entry => target.set(String(entry[0]), String(entry[1])));
      }
      return this;
    }
    if (value == null) target.delete(arg0);
    else target.set(arg0, String(value));
    return this;
  }

  observe(observe: HttpObserveType.Body): HttpRequestObservable<TBody, TBody, TRequestOptions, TResponseExt>;
  observe(
    observe: HttpObserveType.ResponseHeader,
  ): HttpRequestObservable<HttpResponse<void> & TResponseExt, TBody, TRequestOptions, TResponseExt>;
  observe(
    observe: HttpObserveType.Response,
  ): HttpRequestObservable<HttpResponse<TBody> & TResponseExt, TBody, TRequestOptions, TResponseExt>;
  observe(
    observe: HttpObserveType.Events,
  ): HttpRequestObservable<HttpEvent<TBody, TResponseExt>, TBody, TRequestOptions, TResponseExt>;
  observe(observe: HttpObserveType): Observable<any> {
    if (observe === this[kContext].observe) return this;
    const cloned = this.clone();
    cloned[kContext].observe = observe || HttpObserveType.Body;
    return cloned;
  }

  getBody(): Promise<TBody> {
    return lastValueFrom(this.observe(HttpObserveType.Body));
  }

  getResponse(): Promise<HttpResponse<TBody> & TResponseExt> {
    return lastValueFrom(this.observe(HttpObserveType.Response));
  }
}
