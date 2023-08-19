import { toArrayDef } from 'putil-varhelpers';
import { StrictOmit } from 'ts-gems';
import type { PartialInput } from '@opra/common';
import { OpraFilter } from '@opra/common';
import { kContext, kRequest } from './constants.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpResponse } from './http-response.js';
import { HttpClientContext, HttpEvent, HttpObserveType } from './types.js';

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
  protected [kContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kContext] = context;
  }

  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.CreateOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  create(data: PartialInput<TType>, options?: HttpCollectionNode.CreateOptions) {
    const context = this[kContext];
    context.endpoint = 'create';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'POST';
    request.url.resolve(context.source);
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
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<never, never, TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<never>, never, TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<HttpCollectionNode.DeleteOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, never, TResponseExt>
  delete(id: any, options?: HttpCollectionNode.DeleteOptions) {
    if (id == null)
      throw new TypeError(`'id' argument must have a value`);
    const context = this[kContext];
    context.endpoint = 'delete';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'DELETE';
    request.url.join({resource: context.source, key: id});
    return requestHost as any;
  }

  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<HttpCollectionNode.DeleteManyBody, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<HttpCollectionNode.DeleteManyBody>, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(
      options?: StrictOmit<HttpCollectionNode.DeleteManyOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, HttpCollectionNode.DeleteManyBody, TResponseExt>
  deleteMany(options?: HttpCollectionNode.DeleteManyOptions) {
    const context = this[kContext];
    context.endpoint = 'deleteMany';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'DELETE';
    request.url.join(context.source);
    if (options?.filter)
      request.params.set('$filter', String(options.filter));
    return requestHost as any;
  }

  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  get(
      id: any,
      options?: StrictOmit<HttpCollectionNode.GetOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  get(id: any, options?: HttpCollectionNode.GetOptions) {
    if (id == null)
      throw new TypeError(`'id' argument must have a value`);
    const context = this[kContext];
    context.endpoint = 'get';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'GET';
    request.url.join({resource: context.source, key: id});
    if (options?.include)
      request.params.set('$include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      request.params.set('$pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      request.params.set('$omit', toArrayDef(options.omit, []).join(','));
    return requestHost as any;
  }

  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'>
  ): HttpRequestObservable<TType[], TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType[], TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType[]>, TType, TResponseExt>
  findMany(
      options?: StrictOmit<HttpCollectionNode.FindManyOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  findMany(options?: HttpCollectionNode.FindManyOptions) {
    const context = this[kContext];
    context.endpoint = 'findMany';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'GET';
    request.url.join(context.source);
    if (options?.include)
      request.params.set('$include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      request.params.set('$pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      request.params.set('$omit', toArrayDef(options.omit, []).join(','));
    if (options?.sort)
      request.params.set('$sort', toArrayDef(options.sort, []).join(','));
    if (options?.filter)
      request.params.set('$filter', String(options.filter));
    if (options?.limit != null)
      request.params.set('$limit', String(options.limit));
    if (options?.skip != null)
      request.params.set('$skip', String(options.skip));
    if (options?.count != null)
      request.params.set('$count', String(options.count));
    if (options?.distinct != null)
      request.params.set('$distinct', String(options.distinct));
    return requestHost as any;
  }

  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<TType, TType, TResponseExt>
  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<TType>, TType, TResponseExt>
  update(
      id: any,
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, TType, TResponseExt>
  update(id: any, data: PartialInput<TType>, options?: HttpCollectionNode.UpdateOptions) {
    if (id == null)
      throw new TypeError(`'id' argument must have a value`);
    const context = this[kContext];
    context.endpoint = 'update';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'PATCH';
    request.url.join({resource: context.source, key: id});
    request.body = data;
    if (options?.include)
      request.params.set('$include', String(options.include));
    if (options?.pick)
      request.params.set('$pick', String(options.pick));
    if (options?.omit)
      request.params.set('$omit', String(options.omit));
    return requestHost as any;
  }

  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe?: HttpObserveType.Body }
  ): HttpRequestObservable<HttpCollectionNode.UpdateManyBody, HttpCollectionNode.DeleteManyBody, TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe: HttpObserveType.Response }
  ): HttpRequestObservable<HttpResponse<HttpCollectionNode.UpdateManyBody>, HttpCollectionNode.DeleteManyBody, TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: StrictOmit<HttpCollectionNode.UpdateManyOptions, 'observe'> & { observe: HttpObserveType.Events }
  ): HttpRequestObservable<HttpEvent, HttpCollectionNode.UpdateManyBody, TResponseExt>
  updateMany(data: PartialInput<TType>, options?: HttpCollectionNode.UpdateManyOptions) {
    const context = this[kContext];
    context.endpoint = 'updateMany';
    const requestHost = new HttpRequestObservable(context, options);
    const request = requestHost[kRequest];
    request.method = 'PATCH';
    request.url.join(context.source);
    request.body = data;
    if (options?.filter)
      request.params.set('$filter', String(options.filter));
    return requestHost as any;
  }

}
