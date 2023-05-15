import { StrictOmit } from 'ts-gems';
import { PartialInput } from '@opra/common';
import { kHttpClientContext } from '../constants.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpResponse } from './http-response.js';
import { HttpClientContext, HttpEvent } from './http-types.js';

export namespace HttpSingletonNode {
  export interface CreateOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface DeleteOptions extends HttpRequestObservable.Options {
  }

  export interface GetOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface UpdateOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
}


export class HttpSingletonNode<TType, TResponseExt = any> {
  protected [kHttpClientContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kHttpClientContext] = context;
  }

  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  create(data: PartialInput<TType>, options?: HttpSingletonNode.CreateOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'POST';
    request.url = context.resourceName;
    request.body = data;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    return requestHost as any;
  }

  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<never, never, TResponseExt>
  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<never>, never, TResponseExt>
  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, never, TResponseExt>
  delete(options?: HttpSingletonNode.DeleteOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'DELETE';
    request.path.join({resource: context.resourceName});
    return requestHost as any;
  }

  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  get(options?: HttpSingletonNode.GetOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'GET';
    request.path.join({resource: context.resourceName});
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    return requestHost as any;
  }

  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  update(data: PartialInput<TType>, options?: HttpSingletonNode.UpdateOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'PATCH';
    request.path.join({resource: context.resourceName});
    request.body = data;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    return requestHost as any;
  }

}
