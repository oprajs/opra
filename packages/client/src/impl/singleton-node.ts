import { toArrayDef } from 'putil-varhelpers';
import { PartialInput } from '@opra/common';
import type { OpraHttpClient } from '../client.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 * @class HttpSingletonNode
 */
export class HttpSingletonNode<TType, TResponseExt = {}> {
  protected _client: OpraHttpClient;
  protected _path: string;

  constructor(client: OpraHttpClient<any>, path: string) {
    this._client = client;
    this._path = path;
  }

  create(
      data: PartialInput<TType>,
      options?: HttpSingletonNode.CreateOptions
  ): HttpRequestObservable<TType, TResponseExt> {
    const observable =
        new HttpRequestObservable<TType, TResponseExt>(this._client, {
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

  delete(): HttpRequestObservable<never, TResponseExt> {
    return new HttpRequestObservable<never, TResponseExt>(this._client, {
      method: 'DELETE',
      url: this._path
    });
  }

  get(options?: HttpSingletonNode.GetOptions): HttpRequestObservable<TType, TResponseExt> {
    const observable =
        new HttpRequestObservable<TType, TResponseExt>(this._client, {
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
      data: PartialInput<TType>,
      options?: HttpSingletonNode.UpdateOptions
  ): HttpRequestObservable<TType, TResponseExt> {
    const observable =
        new HttpRequestObservable<TType, TResponseExt>(this._client, {
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
