import { toArrayDef } from 'putil-varhelpers';
import { DTO, OperationResult, PatchDTO } from '@opra/common';
import { HttpBackend } from './http-backend.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpSingletonNode
 */
export class HttpSingletonNode<TType, TRequestOptions = {}, TResponseExt = {}> {
  protected _backend: HttpBackend;
  protected _path: string;

  constructor(backend: HttpBackend, path: string) {
    this._backend = backend;
    this._path = path;
  }

  create(
      data: DTO<TType>,
      options?: HttpSingletonNode.CreateOptions
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

  delete() {
    return new HttpRequestObservable<
        OperationResult<never>,
        OperationResult<never>,
        TRequestOptions,
        TResponseExt
    >(this._backend, {
      method: 'DELETE',
      url: this._path
    });
  }

  get(options?: HttpSingletonNode.GetOptions) {
    const observable =
        new HttpRequestObservable<
            OperationResult<TType>,
            OperationResult<TType>,
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
    return observable;
  }

  update(
      data: PatchDTO<TType>,
      options?: HttpSingletonNode.UpdateOptions
  ) {
    const observable =
        new HttpRequestObservable<
            OperationResult<TType>,
            OperationResult<TType>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
          method: 'PATCH',
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
}

/**
 * @namespace HttpSingletonNode
 */
export namespace HttpSingletonNode {
  export interface CreateOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface GetOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }

  export interface UpdateOptions {
    pick?: string[];
    omit?: string[];
    include?: string[];
  }
}
