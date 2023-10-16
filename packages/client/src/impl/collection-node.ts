import { toArrayDef } from 'putil-varhelpers';
import type { PartialInput } from '@opra/common';
import { OperationResult, OpraFilter, OpraURL } from '@opra/common';
import type { OpraHttpClient } from '../client.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpCollectionNode
 */
export class HttpCollectionNode<TType, TResponseExt = {}> {
  protected _client: OpraHttpClient;
  protected _path: string;

  constructor(client: OpraHttpClient<any>, path: string) {
    this._client = client;
    this._path = path;
  }

  create(
      data: PartialInput<TType>,
      options?: HttpCollectionNode.CreateOptions
  ): HttpRequestObservable<OperationResult<TType>, TResponseExt> {
    const observable =
        new HttpRequestObservable<OperationResult<TType>, TResponseExt>(this._client, {
          method: 'POST',
          url: this._path,
          body: data
        });
    if (options?.include)
      observable.param('include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      observable.param('pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      observable.param('omit', toArrayDef(options.omit, []).join(','));
    return observable;
  }

  delete(id: any): HttpRequestObservable<OperationResult<never>, TResponseExt> {
    if (id == null || id === '')
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    return new HttpRequestObservable<never, TResponseExt>(this._client, {
      method: 'DELETE',
      url
    });
  }

  deleteMany(
      options?: HttpCollectionNode.DeleteManyOptions
  ): HttpRequestObservable<OperationResult<never>, TResponseExt> {
    const observable =
        new HttpRequestObservable<OperationResult<never>, TResponseExt>(this._client, {
          method: 'DELETE',
          url: this._path
        });
    if (options?.filter)
      observable.param('filter', String(options.filter));
    return observable;
  }

  get(
      id: any,
      options?: HttpCollectionNode.GetOptions
  ): HttpRequestObservable<OperationResult<TType>, TResponseExt> {
    if (id == null || id === '')
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    const observable =
        new HttpRequestObservable<OperationResult<TType>, TResponseExt>(this._client, {
          method: 'GET',
          url
        });
    if (options?.include)
      observable.param('include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      observable.param('pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      observable.param('omit', toArrayDef(options.omit, []).join(','));
    return observable;
  }

  findMany(
      options?: HttpCollectionNode.FindManyOptions
  ): HttpRequestObservable<OperationResult<TType[]>, TResponseExt> {
    const observable =
        new HttpRequestObservable<OperationResult<TType[]>, TResponseExt>(this._client, {
          method: 'GET',
          url: this._path
        });
    if (options?.include)
      observable.param('include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      observable.param('pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      observable.param('omit', toArrayDef(options.omit, []).join(','));
    if (options?.sort)
      observable.param('sort', toArrayDef(options.sort, []).join(','));
    if (options?.filter)
      observable.param('filter', String(options.filter));
    if (options?.limit != null)
      observable.param('limit', String(options.limit));
    if (options?.skip != null)
      observable.param('skip', String(options.skip));
    if (options?.count != null)
      observable.param('count', String(options.count));
    if (options?.distinct != null)
      observable.param('distinct', String(options.distinct));
    return observable;
  }

  update(
      id: any,
      data: PartialInput<TType>,
      options?: HttpCollectionNode.UpdateOptions
  ): HttpRequestObservable<OperationResult<TType>, TResponseExt> {
    if (id == null)
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    const observable =
        new HttpRequestObservable<OperationResult<TType>, TResponseExt>(this._client, {
          method: 'PATCH',
          url,
          body: data
        });
    if (options?.include)
      observable.param('include', toArrayDef(options.include, []).join(','));
    if (options?.pick)
      observable.param('pick', toArrayDef(options.pick, []).join(','));
    if (options?.omit)
      observable.param('omit', toArrayDef(options.omit, []).join(','));
    return observable;
  }

  updateMany(
      data: PartialInput<TType>,
      options?: HttpCollectionNode.UpdateManyOptions
  ): HttpRequestObservable<OperationResult<never>, TResponseExt> {
    const observable =
        new HttpRequestObservable<OperationResult<never>, TResponseExt>(this._client, {
          method: 'PATCH',
          url: this._path,
          body: data
        });
    if (options?.filter)
      observable.param('filter', String(options.filter));
    return observable;
  }

}


/**
 * @namespace
 */
export namespace HttpCollectionNode {

  export interface CreateOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface DeleteManyOptions {
    filter?: string | OpraFilter.Expression;
  }

  export interface GetOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface FindManyOptions {
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

  export interface UpdateOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface UpdateManyOptions {
    filter?: string | OpraFilter.Expression;
  }

}
