import { Readable } from 'node:stream';
import { lastValueFrom, Observable, Subscriber } from 'rxjs';
import { isReadableStreamLike } from 'rxjs/internal/util/isReadableStreamLike';
import { StrictOmit, Type } from 'ts-gems';
import {
  HttpHeaders, HttpHeadersInit, HttpParams, HttpParamsInit,
  HttpRequest,
  HttpResponse, HttpResponseInit, isBlob, isReadable,
  joinPath,
  OpraDocument,
} from '@opra/common';
import { ClientError } from '../client-error.js';
import {
  FORMDATA_CONTENT_TYPE_PATTERN,
  JSON_CONTENT_TYPE_PATTERN,
  TEXT_CONTENT_TYPE_PATTERN
} from '../constants.js';
import { HttpCollectionService } from './http-collection-service.js';
import { HttpSingletonService } from './http-singleton-service.js';
import {
  HttpEvent,
  HttpHeadersReceivedEvent,
  HttpRequestDefaults, HttpResponseEvent, ObserveType
} from './http-types.js';

const documentCache = new Map<string, OpraDocument>();
const documentResolverCaches = new Map<string, Promise<any>>();

export interface OpraHttpClientOptions {
  /**
   //    * Opra Service Metadata Document
   //    */
  document?: OpraDocument;
  /**
   *
   */
  defaults?: StrictOmit<HttpRequestDefaults, 'headers' | 'params'> &
      {
        headers?: HttpHeadersInit;
        params?: HttpParamsInit;
      };
}

export abstract class OpraHttpClientBase<TResponseExt = never> {
  protected _serviceUrl: string;
  protected _metadata?: OpraDocument;

  defaults: StrictOmit<HttpRequestDefaults, 'headers' | 'params'> &
      {
        headers: HttpHeaders;
        params: HttpParams;
      };

  constructor(serviceUrl: string, options?: OpraHttpClientOptions) {
    this._serviceUrl = serviceUrl;
    this._metadata = options?.document;
    if (!this._metadata) {
      const document = documentCache.get(this.serviceUrl.toLowerCase());
      if (document)
        this._metadata = document;
    }
    this.defaults = {
      ...options?.defaults,
      headers: options?.defaults?.headers instanceof HttpHeaders
          ? options?.defaults?.headers : new HttpHeaders(options?.defaults?.headers),
      params: options?.defaults?.params instanceof HttpParams
          ? options?.defaults?.params : new HttpParams(options?.defaults?.headers)
    };
  }

  get serviceUrl(): string {
    return this._serviceUrl;
  }

  get initialized(): boolean {
    return !!this._metadata;
  }

  get metadata(): OpraDocument {
    this._assertMetadata();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._metadata!;
  }

  async init(forceRefresh?: boolean): Promise<void> {
    if (!forceRefresh && this.initialized)
      return;
    const cacheName = this.serviceUrl.toLowerCase();
    let promise = documentResolverCaches.get(cacheName);
    if (promise) {
      await promise;
      return;
    }
    promise = this._resolveMetadata();
    documentResolverCaches.set(cacheName, promise);
    return promise
        .catch(() => void 0)
        .finally(() => documentResolverCaches.delete(cacheName));
  }

  // batch(requests: HttpRequestHost<any>[]): BatchRequest {
  // this._assertMetadata();
  // return new BatchRequest(request => this._sendRequest('response', request, requests);
  // }

  collection<TType = any>(name: string | Type<TType>): HttpCollectionService<TType, TResponseExt> {
    this._assertMetadata();
    // If name argument is a class, we extract name from the class
    if (typeof name === 'function')
      name = name.name;
    const resource = this.metadata.getCollectionResource(name);
    return new HttpCollectionService<TType, TResponseExt>(resource, this._sendRequest.bind(this));
  }

  singleton<TType = any>(name: string | Type<TType>): HttpSingletonService<TType, TResponseExt> {
    this._assertMetadata();
    // If name argument is a class, we extract name from the class
    if (typeof name === 'function')
      name = name.name;
    const resource = this.metadata.getSingletonResource(name);
    return new HttpSingletonService<TType, TResponseExt>(resource, this._sendRequest.bind(this));
  }

  protected async _resolveMetadata(): Promise<void> {
    const body = await lastValueFrom(
        this._sendRequest<any>('body',
            new HttpRequest({
              method: 'GET',
              url: '$metadata',
              headers: new HttpHeaders({'accept': 'application/json'})
            })
        )
    );
    this._metadata = new OpraDocument(body);
  }

  protected _sendRequest<TBody>(
      observe: ObserveType,
      request: HttpRequest
  ): Observable<HttpResponse<TBody> | TBody | HttpEvent> {
    return new Observable(subscriber => {
      try {
        request.inset(this.defaults);
        const url = request.url.includes('://') ? request.url : joinPath(this.serviceUrl, request.url);
        let body: any;
        if (request.body) {
          let contentType = request.headers.get('Content-Type');
          if (typeof request.body === 'string' || typeof request.body === 'number' || typeof request.body === 'boolean') {
            contentType = 'text/plain;charset=UTF-8"';
            body = String(request.body);
            request.headers.delete('Content-Size');
            delete request.duplex;
          } else if (isReadableStreamLike(request.body)) {
            contentType = 'application/octet-stream';
            body = request.body;
            request.duplex = 'half';
          } else if (isReadable(request.body)) {
            contentType = 'application/octet-stream';
            body = Readable.toWeb(request.body);
            request.duplex = 'half';
          } else if (Buffer.isBuffer(request.body)) {
            contentType = 'application/octet-stream';
            body = request.body;
            request.headers.set('Content-Size', request.body.length);
            delete request.duplex;
          } else if (isBlob(request.body)) {
            contentType = request.body.type || 'application/octet-stream';
            body = request.body;
            request.headers.set('Content-Size', request.body.length);
            delete request.duplex;
          } else {
            contentType = 'application/json';
            body = JSON.stringify(request.body);
            request.headers.delete('Content-Size');
            delete request.duplex;
          }
          if (!request.headers.has('Content-Type') && contentType)
            request.headers.set('Content-Type', contentType);
          request.body = body;
        }
        this._fetch(url, request)
            .then(response => this._handleResponse(observe, subscriber, request, response))
            .catch(error => subscriber.error(error));
        if (observe === 'events')
          subscriber.next({event: 'sent', request} satisfies HttpEvent);
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  protected _fetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, init);
  }

  protected _createResponse(init?: HttpResponseInit): HttpResponse {
    return new HttpResponse<any>(init);
  }

  protected _handleResponse(
      observe: ObserveType,
      subscriber: Subscriber<any>,
      request: HttpRequest,
      fetchResponse: Response
  ): void {
    const headers = new HttpHeaders(fetchResponse.headers);

    if (observe === 'events') {
      const response = this._createResponse({
        url: fetchResponse.url,
        headers,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        hasBody: !!fetchResponse.body
      })
      subscriber.next({event: 'headers-received', request, response} satisfies HttpHeadersReceivedEvent);
    }

    Promise
        .resolve(fetchResponse.body)
        .then(async (inputStream) => {
          if (!inputStream)
            return;
          if (JSON_CONTENT_TYPE_PATTERN.test(fetchResponse.headers.get('Content-Type') || '')) {
            const body = await fetchResponse.json();
            if (typeof body === 'string')
              return JSON.parse(body);
            return body;
          }
          if (TEXT_CONTENT_TYPE_PATTERN.test(fetchResponse.headers.get('Content-Type') || ''))
            return await fetchResponse.text();
          if (FORMDATA_CONTENT_TYPE_PATTERN.test(fetchResponse.headers.get('Content-Type') || ''))
            return await fetchResponse.formData();
          const buf = await fetchResponse.arrayBuffer();
          return buf.byteLength ? buf : undefined;
        })
        .then(body => {
          if (fetchResponse.status >= 400 && fetchResponse.status < 600) {
            subscriber.error(new ClientError({
              message: fetchResponse.status + ' ' + fetchResponse.statusText,
              status: fetchResponse.status,
              issues: body?.errors
            }));
            subscriber.complete();
            return;
          }
          if (observe === 'body') {
            subscriber.next(body);
          } else {
            const response = this._createResponse({
              url: fetchResponse.url,
              headers,
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              body
            });
            if (observe === 'events')
              subscriber.next({event: 'response', request, response} satisfies HttpResponseEvent);
            else
              subscriber.next(response);
          }
          subscriber.complete();
        })
        .catch(error => subscriber.error(error))
  }

  protected _assertMetadata() {
    if (!this._metadata)
      throw new Error('You must call init() to before using the client instance');
  }

  static async create<T extends OpraHttpClient>(
      this: Type<T>,
      serviceUrl: string,
      options?: OpraHttpClientOptions
  ): Promise<T> {
    const client = new this(serviceUrl, options);
    if (!client._metadata)
      await client.init();
    return client as T;
  }

}

export class OpraHttpClient extends OpraHttpClientBase {

}
