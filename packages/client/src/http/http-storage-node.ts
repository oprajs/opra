import { OperationResult, OpraURL } from '@opra/common';
import { HttpBackend } from './http-backend.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpStorageNode
 */
export class HttpStorageNode<TRequestOptions = {}, TResponseExt = {}> {
  protected _backend: HttpBackend;
  protected _path: string;

  constructor(backend: HttpBackend, path: string) {
    this._backend = backend;
    this._path = path;
  }

  delete(path?: string) {
    if (path) {
      const url = new OpraURL(this._path);
      url.join(path);
      path = url.toString();
    } else path = this._path;
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


  get(path?: string) {
    if (path) {
      const url = new OpraURL(this._path);
      url.join(path);
      path = url.toString();
    } else path = this._path;
    const observable =
        new HttpRequestObservable<
            OperationResult<any>,
            OperationResult<any>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
          method: 'GET',
          url: this._path
        });
    return observable;
  }

  post(data: FormData, path?: string) {
    if (path) {
      const url = new OpraURL(this._path);
      url.join(path);
      path = url.toString();
    } else path = this._path;
    const observable =
        new HttpRequestObservable<
            OperationResult<any>,
            OperationResult<any>,
            TRequestOptions,
            TResponseExt
        >(this._backend, {
          method: 'POST',
          url: path,
          body: data
        });
    return observable;
  }

}
