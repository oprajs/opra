import { StrictOmit } from 'ts-gems';
import type { PartialInput } from '@opra/common';
import { OpraFilter } from '@opra/common';
import { kHttpClientContext } from '../constants.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpResponse } from './http-response.js';
import { HttpClientContext, HttpEvent } from './http-types.js';

export namespace HttpCollectionNode {

  export interface CreateOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface DeleteOptions extends HttpRequestObservable.Options {
  }

  export interface DeleteManyOptions extends HttpRequestObservable.Options {
    filter?: string | OpraFilter.Expression;
  }

  export interface GetOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface FindManyOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
    filter?: string | OpraFilter.Expression;
    limit?: number;
    skip?: number;
    distinct?: boolean;
    count?: boolean;
    sort?: string[];
  }

  export interface UpdateOptions extends HttpRequestObservable.Options {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface UpdateManyOptions extends HttpRequestObservable.Options {
    filter?: string | OpraFilter.Expression;
  }

  export interface DeleteManyBody {
    affected: number;
  }

  export interface UpdateManyBody {
    affected: number;
  }

}

export class HttpCollectionNode<TType, TResponseExt = {}> {
  protected [kHttpClientContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kHttpClientContext] = context;
  }

  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  create(data: PartialInput<TType>, options?: HttpCollectionNode.CreateOptions) {
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
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<never, never, TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<never>, never, TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, never, TResponseExt>
  delete(id: any, options?: HttpCollectionNode.DeleteOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'DELETE';
    request.path.join({resource: context.resourceName, key: id});
    return requestHost as any;
  }

  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<HttpCollectionNode.DeleteManyBody, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<HttpCollectionNode.DeleteManyBody>, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(options?: HttpCollectionNode.DeleteManyOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'DELETE';
    request.url = context.resourceName;
    if (options?.filter)
      request.params.set('$filter', options.filter);
    return requestHost as any;
  }

  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  get(id: any, options?: HttpCollectionNode.GetOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'GET';
    request.path.join({resource: context.resourceName, key: id});
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    return requestHost as any;
  }

  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'>
  ): HttpRequestObservable<TType[], TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType[], TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType[]>, TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  findMany(options?: HttpCollectionNode.FindManyOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'GET';
    request.url = context.resourceName;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    if (options?.sort)
      request.params.set('$sort', options.sort);
    if (options?.filter)
      request.params.set('$filter', options.filter);
    if (options?.limit != null)
      request.params.set('$limit', options.limit);
    if (options?.skip != null)
      request.params.set('$skip', options.skip);
    if (options?.count != null)
      request.params.set('$count', options.count);
    if (options?.distinct != null)
      request.params.set('$distinct', options.distinct);
    return requestHost as any;
  }

  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  update(id: any, data: PartialInput<TType>, options?: HttpCollectionNode.UpdateOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'PATCH';
    request.path.join({resource: context.resourceName, key: id});
    request.body = data;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    return requestHost as any;
  }

  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe?: 'body' }
  ): HttpRequestObservable<HttpCollectionNode.UpdateManyBody, HttpCollectionNode.DeleteManyBody, TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe: 'response' }
  ): HttpRequestObservable<HttpResponse<HttpCollectionNode.UpdateManyBody>, HttpCollectionNode.DeleteManyBody, TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe: 'events' }
  ): HttpRequestObservable<HttpEvent, HttpCollectionNode.UpdateManyBody, TResponseExt>
  updateMany(data: PartialInput<TType>, options?: HttpCollectionNode.UpdateManyOptions) {
    const context = this[kHttpClientContext];
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[HttpRequestObservable.kRequest];
    request.method = 'PATCH';
    request.url = context.resourceName;
    request.body = data;
    if (options?.filter)
      request.params.set('$filter', options.filter);
    return requestHost as any;
  }

}
