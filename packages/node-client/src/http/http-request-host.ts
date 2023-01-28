import { lastValueFrom, Observable } from 'rxjs';
import {
  ClientHttpHeaders,
  HttpRequest, HttpResponse,
  uid
} from '@opra/common';
import { kHttpClientContext } from '../constants.js';
import {
  CommonHttpRequestOptions,
  HttpClientContext,
  HttpEvent,
  ObserveType
} from './http-types.js';

const kRequest = Symbol('kRequest');

export class HttpRequestHost<T, TBody, TResponse extends HttpResponse<TBody>> extends Observable<T> {
  protected static kContext = kHttpClientContext;
  protected static kRequest = kRequest;
  readonly contentId: string;
  protected [kHttpClientContext]: HttpClientContext;
  protected [kRequest]: HttpRequest;

  constructor(
      context: HttpClientContext,
      options?: CommonHttpRequestOptions
  ) {
    super((subscriber) => {
      context.send(options?.observe || 'body', this[kRequest]).subscribe((subscriber));
    });
    this[kHttpClientContext] = context;
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
    return lastValueFrom(this[kHttpClientContext].send(observe || 'body', this[kRequest]));
  }

  with(cb: (_this: this) => void): this {
    cb(this);
    return this;
  }

}
