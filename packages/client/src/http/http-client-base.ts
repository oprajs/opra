import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { kBackend } from '../constants.js';
import { ClientBase } from '../core/client-base.js';
import { HttpBackend } from './http-backend.js';
import { HttpCollectionNode } from './http-collection-node.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpSingletonNode } from './http-singleton-node.js';

/**
 *
 * @class OpraClientBase
 * @abstract
 */
export abstract class HttpClientBase<TRequestOptions = {}, TResponseExt = {}> extends ClientBase {
  [kBackend]: HttpBackend;
  protected _metadataPromise?: Promise<any>;

  protected constructor(backend: HttpBackend) {
    super(backend);
  }

  get serviceUrl(): string {
    return this[kBackend].serviceUrl;
  }

  async getMetadata(): Promise<ApiDocument> {
    let promise = this._metadataPromise;
    if (promise)
      return promise;
    const request = new HttpRequestObservable(this[kBackend], {
      method: 'GET',
      url: '/',
      headers: new Headers({'accept': 'application/json'})
    })
    this._metadataPromise = promise = request.getBody();
    return await promise
        .then(async (body) => {
          if (!body)
            throw new Error(`No response returned.`);
          const api = await ApiDocumentFactory.createDocument(body);
          this[kBackend].api = api;
          return api;
        })
        .catch((e) => {
          e.message = 'Unable to fetch metadata from service url (' + this.serviceUrl + '). ' + e.message
          throw e;
        })
        .finally(() => delete this._metadataPromise);
  }

  collection<TType = any>(path: string) {
    return new HttpCollectionNode<TType, TRequestOptions, TResponseExt>(this[kBackend], path);
  }

  singleton<TType = any>(path: string) {
    return new HttpSingletonNode<TType, TRequestOptions, TResponseExt>(this[kBackend], path);
  }

  action<T = any>(
      path: string,
      params?: Record<string, any>
  ) {
    const observable =
        new HttpRequestObservable<T, T, TRequestOptions, TResponseExt>(this[kBackend], {
          method: 'GET',
          url: path
        });
    if (params) {
      Object.keys(params).forEach(k => params[k] = String(params[k]));
      observable.param(params as any);
    }
    return observable;
  }

}


/**
 *
 * @namespace OpraClientBase
 */
export namespace OpraClientBase {
  export interface Options extends ClientBase.Options {
    api?: ApiDocument;
  }
}