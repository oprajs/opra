import { StrictOmit } from 'ts-gems';
import { ApiDocument, ApiDocumentFactory, URLSearchParamsInit } from '@opra/common';
import { kBackend } from '../constants.js';
import { HttpBackend } from './http-backend.js';
import { HttpRequestObservable } from './http-request-observable.js';

/**
 *
 * @namespace OpraClientBase
 */
export namespace OpraClientBase {
  export interface Options {
    document?: ApiDocument;
  }

  export type RequestOptions = Partial<StrictOmit<HttpBackend.RequestInit, 'url'>> & {
    params?: URLSearchParamsInit;
  };
}

/**
 *
 * @class OpraClientBase
 * @abstract
 */
export abstract class HttpClientBase<TRequestOptions = {}, TResponseExt = {}> {
  protected [kBackend]: HttpBackend;

  protected constructor(backend: HttpBackend) {
    Object.defineProperty(this, kBackend, {
      enumerable: false,
      value: backend,
    });
  }

  get serviceUrl(): string {
    return this[kBackend].serviceUrl;
  }

  async fetchSchema(options?: { documentId?: string }): Promise<ApiDocument> {
    const req = this.request('$schema', {
      headers: new Headers({ accept: 'application/json' }),
    });
    if (options?.documentId) req.param('id', options?.documentId);
    const body = await req.getBody().catch(e => {
      e.message = 'Error fetching api schema from url (' + this.serviceUrl + ').\n' + e.message;
      throw e;
    });
    return await ApiDocumentFactory.createDocument(body).catch(e => {
      e.message = 'Error loading api document.\n' + e.message;
      throw e;
    });
  }

  request<TBody = any>(path: string, options?: OpraClientBase.RequestOptions) {
    const observable = new HttpRequestObservable<TBody, TBody, TRequestOptions, TResponseExt>(this[kBackend], {
      ...options,
      method: options?.method || 'GET',
      url: new URL(path, this.serviceUrl),
    });
    if (options?.params) observable.param(options.params);
    return observable;
  }

  delete<TBody = any>(path: string, options?: StrictOmit<OpraClientBase.RequestOptions, 'method' | 'body'>) {
    return this.request<TBody>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  get<TBody = any>(path: string, options?: StrictOmit<OpraClientBase.RequestOptions, 'method' | 'body'>) {
    return this.request<TBody>(path, {
      ...options,
      method: 'GET',
    });
  }

  patch<TBody = any>(
    path: string,
    requestBody: any,
    options?: StrictOmit<OpraClientBase.RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<TBody>(path, {
      ...options,
      method: 'PATCH',
      body: requestBody,
    });
  }

  post<TBody = any>(
    path: string,
    requestBody: any,
    options?: StrictOmit<OpraClientBase.RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<TBody>(path, {
      ...options,
      method: 'POST',
      body: requestBody,
    });
  }

  put<TBody = any>(
    path: string,
    requestBody: any,
    options?: StrictOmit<OpraClientBase.RequestOptions, 'method' | 'body'>,
  ) {
    return this.request<TBody>(path, {
      ...options,
      method: 'PUT',
      body: requestBody,
    });
  }
}
