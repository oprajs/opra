import { lastValueFrom, Observable } from 'rxjs';
import { uid } from '@opra/common';
import { kContext, kRequest } from './constants.js';
import { HttpRequest } from './http-request.js';
import { HttpResponse } from './http-response.js';
import {
  HttpClientContext,
  HttpEvent, HttpObserveType,
  HttpRequestDefaults
} from './types.js';

export namespace HttpRequestObservable {
  export interface Options {
    observe?: HttpObserveType;
    http?: HttpRequestDefaults;
  }
}

export class HttpRequestObservable<T, TBody, TResponseExt = {}>
    extends Observable<T> {
  readonly contentId: string;
  protected [kContext]: HttpClientContext;
  protected [kRequest]: HttpRequest;

  constructor(
      context: HttpClientContext,
      options?: HttpRequestObservable.Options
  ) {
    super((subscriber) => {
      context.send(options?.observe || HttpObserveType.Body, this[kRequest])
          .subscribe((subscriber));
    });
    this[kContext] = context;
    this[kRequest] = new HttpRequest(options?.http);
    this.contentId = uid(6);
  }

  header(name: string, value: string | string[]): this {
    const headers = this[kRequest].headers;
    if (Array.isArray(value))
      value.forEach(v => headers.append(name, String(v)))
    else
      headers.append(name, value);
    return this;
  }

  param(name: string, value: any): this {
    this[kRequest].params.append(name, value);
    return this;
  }

  async fetch(): Promise<TBody>
  async fetch(observe: HttpObserveType.Body): Promise<TBody>
  async fetch(observe: HttpObserveType.Response): Promise<HttpResponse<TBody> & TResponseExt>
  async fetch(observe?: HttpObserveType): Promise<TBody | (HttpResponse<TBody> & TResponseExt) | HttpEvent> {
    return lastValueFrom(this[kContext]
        .send(observe || HttpObserveType.Body, this[kRequest]));
  }

  with(cb: (_this: this) => void): this {
    cb(this);
    return this;
  }

}
