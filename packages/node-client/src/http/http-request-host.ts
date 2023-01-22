import { lastValueFrom, Observable } from 'rxjs';
import {
  ClientHttpHeaders,
  HttpRequest, HttpResponse,
  uid
} from '@opra/common';
import {
  CommonHttpRequestOptions,
  HttpEvent,
  HttpRequestHandler, ObserveType
} from './http-types.js';

const kHandler = Symbol('kHandler');
const kRequest = Symbol('kRequest');

export class HttpRequestHost<T, TBody, TResponse extends HttpResponse<TBody>> extends Observable<T> {
  protected static kHandler = kHandler;
  protected static kRequest = kRequest;
  readonly contentId: string;
  protected [kRequest]: HttpRequest;

  constructor(
      handler: HttpRequestHandler,
      options?: CommonHttpRequestOptions
  ) {
    super((subscriber) => {
      handler(options?.observe || 'body', this[kRequest]).subscribe((subscriber));
    });
    this[kHandler] = handler;
    this[kRequest] = new HttpRequest(options?.http);
    this.contentId = uid(6);
  }

  header<K extends keyof ClientHttpHeaders>(name: K, value: ClientHttpHeaders[K]): this {
    this[kRequest].headers.append(name, value);
    return this;
  }

  param(name: string, value: any): this {
    this[kRequest].params.append(name, value);
    return this;
  }

  async fetch(): Promise<TBody>
  async fetch(observe: 'body'): Promise<TBody>
  async fetch(observe: 'response'): Promise<TResponse>
  async fetch(observe?: ObserveType): Promise<TBody | TResponse | HttpEvent> {
    return lastValueFrom(this[kHandler](observe || 'body', this[kRequest]));
  }

  with(cb: (_this: this) => void): this {
    cb(this);
    return this;
  }

}
