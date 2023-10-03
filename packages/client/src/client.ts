import { StrictOmit } from 'ts-gems';
import { ApiDocument, ApiDocumentFactory } from '@opra/common';
import { kContext } from './constants.js';
import { HttpCollectionNode } from './impl/collection-node.js';
import { HttpRequestObservable } from './impl/http-request-observable.js';
import { HttpResponse } from './impl/http-response.js';
import { HttpSingletonNode } from './impl/singleton-node.js';
import { OpraHttpClientContext } from './interfaces/client-context.interface.js';
import { HttpRequestDefaults } from './interfaces/index.js';
import { RequestInterceptor, ResponseInterceptor } from './types.js';

export namespace OpraHttpClient {
  export interface Options {
    api?: ApiDocument;
    requestInterceptors?: RequestInterceptor[];
    responseInterceptors?: ResponseInterceptor[];
    defaults?: HttpRequestDefaults;
  }

  export type Defaults = StrictOmit<HttpRequestDefaults, 'headers' | 'params'> &
      {
        headers: Headers;
        params: URLSearchParams;
      };
}

export class OpraHttpClient<TResponseExt = {}> {
  protected _metadataPromise?: Promise<any>;
  [kContext]: OpraHttpClientContext;

  constructor(serviceUrl: string, options?: OpraHttpClient.Options) {
    const context: OpraHttpClientContext = {
      serviceUrl,
      requestInterceptors: [...(options?.requestInterceptors || [])],
      responseInterceptors: [...(options?.responseInterceptors || [])],
      api: options?.api,
      defaults: {
        ...options?.defaults,
        headers: options?.defaults?.headers instanceof Headers
            ? options?.defaults?.headers : new Headers(options?.defaults?.headers),
        params: options?.defaults?.params instanceof URLSearchParams
            ? options?.defaults?.params : new URLSearchParams(options?.defaults?.params)
      },
      fetch,
      createResponse: (init?: HttpResponse.Initiator) => new HttpResponse(init)
    };
    Object.defineProperty(this, kContext, {
          enumerable: false,
          value: context
        }
    );
  }

  get serviceUrl(): string {
    return this[kContext].serviceUrl;
  }

  get api(): ApiDocument | undefined {
    return this[kContext].api;
  }

  get defaults(): OpraHttpClient.Defaults {
    return this[kContext].defaults;
  }

  async getMetadata(): Promise<ApiDocument> {
    let promise = this._metadataPromise;
    if (promise)
      return promise;
    const controller = new HttpRequestObservable(this, {
      method: 'GET',
      url: '',
      headers: {'accept': 'application/json'}
    })
    this._metadataPromise = promise = controller.getData();
    return await promise
        .then(async (body) => {
          if (!body)
            throw new Error(`No response returned.`);
          const api = await ApiDocumentFactory.createDocument(body);
          this[kContext].api = api;
          return api;
        })
        .catch((e) => {
          e.message = 'Unable to fetch metadata from service url (' + this.serviceUrl + '). ' + e.message
          throw e;
        })
        .finally(() => delete this._metadataPromise);
  }

  collection<TType = any>(path: string): HttpCollectionNode<TType, TResponseExt> {
    return new HttpCollectionNode<TType, TResponseExt>(this, path);
  }

  singleton<TType = any>(path: string): HttpSingletonNode<TType, TResponseExt> {
    return new HttpSingletonNode<TType, TResponseExt>(this, path);
  }

  action<T = any>(
      path: string,
      params?: Record<string, any>
  ): HttpRequestObservable<T, TResponseExt> {
    const observable =
        new HttpRequestObservable<T, TResponseExt>(this, {
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
