import { ApiDocument, ApiDocumentFactory, ResponsiveMap } from '@opra/common';
import { kBackend } from '../constants.js';
import { ClientBase } from '../core/client-base.js';
import { HttpBackend } from './http-backend.js';
import { HttpCollectionNode } from './http-collection-node.js';
import { HttpRequestObservable } from './http-request-observable.js';
import { HttpSingletonNode } from './http-singleton-node.js';
import { HttpStorageNode } from './http-storage-node.js';

/**
 *
 * @class OpraClientBase
 * @abstract
 */
export abstract class HttpClientBase<TRequestOptions = {}, TResponseExt = {}> extends ClientBase {
  [kBackend]: HttpBackend;
  protected _collectionCache = new ResponsiveMap<HttpCollectionNode<any>>();
  protected _singletonCache = new ResponsiveMap<HttpCollectionNode<any>>();
  protected _storageCache = new ResponsiveMap<HttpStorageNode<any>>();
  protected _metadataPromise?: Promise<any>;

  protected constructor(backend: HttpBackend) {
    super(backend);
  }

  get serviceUrl(): string {
    return this[kBackend].serviceUrl;
  }

  async getMetadata(): Promise<ApiDocument> {
    if (this._metadataPromise)
      return this._metadataPromise;
    const request = new HttpRequestObservable(this[kBackend], {
      method: 'GET',
      url: '/',
      headers: new Headers({'accept': 'application/json'})
    })
    let body: any;
    try {
      this._metadataPromise = request.getBody();
      body = await this._metadataPromise;
    } catch (e: any) {
      e.message = 'Error fetching metadata from url (' + this.serviceUrl + ').\n' + e.message;
      throw e;
    } finally {
      this._metadataPromise = undefined;
    }
    try {
      const api = await ApiDocumentFactory.createDocument(body);
      this[kBackend].api = api;
      return api;
    } catch (e: any) {
      e.message = 'Error loading api document.\n' + e.message;
      throw e;
    }
  }

  collection<TType = any>(path: string): HttpCollectionNode<TType, TRequestOptions, TResponseExt> {
    let node: any = this._collectionCache.get(path);
    if (!node) {
      node = new HttpCollectionNode(this[kBackend], path);
      this._collectionCache.set(path, node);
    }
    return node;
  }

  singleton<TType = any>(path: string): HttpSingletonNode<TType, TRequestOptions, TResponseExt> {
    let node: any = this._singletonCache.get(path);
    if (!node) {
      node = new HttpSingletonNode(this[kBackend], path);
      this._singletonCache.set(path, node);
    }
    return node;
  }

  storage(path: string): HttpStorageNode<TRequestOptions, TResponseExt> {
    let node: any = this._storageCache.get(path);
    if (!node) {
      node = new HttpStorageNode(this[kBackend], path);
      this._storageCache.set(path, node);
    }
    return node;
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
