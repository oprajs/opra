import { toArrayDef } from 'putil-varhelpers';
import { DTO, OperationResult, OpraFilter, OpraURL, PatchDTO } from '@opra/common';
import { HttpBackend } from './http-backend.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpCollectionNode
 */
export class HttpCollectionNode<TType, TRequestOptions = {}, TResponseExt = {}> {
  protected _backend: HttpBackend;
  protected _path: string;

  constructor(backend: HttpBackend, path: string) {
    this._backend = backend;
    this._path = path;
  }

  create(
      data: DTO<TType>,
      options?: HttpCollectionNode.CreateOptions
  ) {
    const observable =
        new HttpRequestObservable<
            OperationResult<TType>,
            OperationResult<TType>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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

  delete(id: any) {
    if (id == null || id === '')
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    return new HttpRequestObservable<
        OperationResult<never>,
        OperationResult<never>,
        TRequestOptions,
        TResponseExt
    >(this._backend, {
      method: 'DELETE',
      url
    });
  }

  deleteMany(
      options?: HttpCollectionNode.DeleteManyOptions
  ) {
    const observable =
        new HttpRequestObservable<
            OperationResult<never>,
            OperationResult<never>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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
  ) {
    if (id == null || id === '')
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    const observable =
        new HttpRequestObservable<
            OperationResult<TType>,
            OperationResult<TType>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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
  ) {
    const observable =
        new HttpRequestObservable<
            OperationResult<TType[]>,
            OperationResult<TType[]>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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
      data: PatchDTO<TType>,
      options?: HttpCollectionNode.UpdateOptions
  ) {
    if (id == null)
      throw new TypeError(`'id' argument must have a value`);
    const url = new OpraURL();
    url.join({resource: this._path, key: id});
    const observable =
        new HttpRequestObservable<
            OperationResult<TType>,
            OperationResult<TType>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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
      data: PatchDTO<TType>,
      options?: HttpCollectionNode.UpdateManyOptions
  ) {
    const observable =
        new HttpRequestObservable<
            OperationResult<never>,
            OperationResult<never>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
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
