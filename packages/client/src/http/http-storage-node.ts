import { OperationResult } from '@opra/common';
import { HttpBackend } from './http-backend.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpStorageNode
 */
export class HttpStorageNode<TType, TRequestOptions = {}, TResponseExt = {}> {
  protected _backend: HttpBackend;
  protected _path: string;

  constructor(backend: HttpBackend, path: string) {
    this._backend = backend;
    this._path = path;
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


  get() {
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
    return observable;
  }

  post(data: FormData) {
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
    return observable;
  }

}
