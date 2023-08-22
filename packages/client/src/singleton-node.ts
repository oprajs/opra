import { toArrayDef } from 'putil-varhelpers';
import { StrictOmit } from 'ts-gems';
import { PartialInput } from '@opra/common';
import { kContext, kRequest } from './constants.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpResponse } from './http-response.js';
import { HttpClientContext, HttpEvent, HttpObserveType } from './types.js';

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


export class HttpSingletonNode<TType, TResponseExt = {}> {
  protected [kContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kContext] = context;
  }

  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.CreateOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  create(data: PartialInput<TType>, options?: HttpSingletonNode.CreateOptions) {
    const context = this[kContext];
    context.endpoint = 'create';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'POST';
    request.url.join(context.resource);
    request.body = data;
    if (options?.include)
      request.params.set('$include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      request.params.set('$pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      request.params.set('$omit', toArrayDef(options.omit, []).join(','));
    return requestHost as any;
  }

  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<never, never, TResponseExt>
  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<never>, never, TResponseExt>
  delete(
      options?: StrictOmit<HttpSingletonNode.DeleteOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, never, TResponseExt>
  delete(options?: HttpSingletonNode.DeleteOptions) {
    const context = this[kContext];
    context.endpoint = 'delete';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'DELETE';
    request.url.join({resource: context.resource});
    return requestHost as any;
  }

  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  get(
      options?: StrictOmit<HttpSingletonNode.GetOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  get(options?: HttpSingletonNode.GetOptions) {
    const context = this[kContext];
    context.endpoint = 'get';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'GET';
    request.url.join({resource: context.resource});
    if (options?.include)
      request.params.set('$include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      request.params.set('$pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      request.params.set('$omit', toArrayDef(options.omit, []).join(','));
    return requestHost as any;
  }

  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  update(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpSingletonNode.UpdateOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  update(data: PartialInput<TType>, options?: HttpSingletonNode.UpdateOptions) {
    const context = this[kContext];
    context.endpoint = 'update';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'PATCH';
    request.url.join({resource: context.resource});
    request.body = data;
    if (options?.include)
      request.params.set('$include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      request.params.set('$pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      request.params.set('$omit', toArrayDef(options.omit, []).join(','));
    return requestHost as any;
  }

}
