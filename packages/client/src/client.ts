import { lastValueFrom, Observable, Subscriber } from 'rxjs';
import { isReadableStreamLike } from 'rxjs/internal/util/isReadableStreamLike';
import { StrictOmit, Type } from 'ts-gems';
import { ApiDocument, ApiDocumentFactory, isBlob, OpraSchema, OpraURL } from '@opra/common';
import { ClientError } from './client-error.js';
import { HttpCollectionNode } from './collection-node.js';
import {
  FORMDATA_CONTENT_TYPE_PATTERN,
  JSON_CONTENT_TYPE_PATTERN, OPRA_JSON_CONTENT_TYPE_PATTERN,
  TEXT_CONTENT_TYPE_PATTERN
} from './constants.js';
import { HttpRequest } from './http-request.js';
import { HttpResponse } from './http-response.js';
import { HttpSingletonNode } from './singleton-node.js';
import {
  HttpClientContext,
  HttpEvent,
  HttpEventType,
  HttpObserveType,
  HttpRequestDefaults,
  HttpResponseEvent,
  HttpResponseHeaderEvent,
  HttpSentEvent,
  RequestInterceptor,
  ResponseInterceptor,
} from './types.js';

export interface OpraHttpClientOptions {
  /**
   * Opra Service Metadata Document
   */
  api?: ApiDocument;
  /**
   *
   */
  defaults?: HttpRequestDefaults;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

const kAssets = Symbol('kAssets');

export class OpraHttpClient {
  protected static kAssets = kAssets;
  protected [kAssets]: {
    serviceUrl: string;
    api?: ApiDocument;
    metadataPromise?: Promise<any>;
    requestInterceptors: RequestInterceptor[];
    responseInterceptors: ResponseInterceptor[];
  };

  defaults: StrictOmit<HttpRequestDefaults, 'headers' | 'params'> &
      {
        headers: Headers;
        params: URLSearchParams;
      };

  constructor(serviceUrl: string, options?: OpraHttpClientOptions) {
    Object.defineProperty(this, kAssets, {
      enumerable: false,
      value: {
        serviceUrl,
        api: options?.api,
        requestInterceptors: options?.requestInterceptors || [],
        responseInterceptors: options?.responseInterceptors || []
      }
    })
    this.defaults = {
      ...options?.defaults,
      headers: options?.defaults?.headers instanceof Headers
          ? options?.defaults?.headers : new Headers(options?.defaults?.headers),
      params: options?.defaults?.params instanceof URLSearchParams
          ? options?.defaults?.params : new URLSearchParams(options?.defaults?.params)
    };
  }

  get serviceUrl(): string {
    return this[kAssets].serviceUrl;
  }

  async getMetadata(): Promise<ApiDocument> {
    if (this[kAssets].api)
      return this[kAssets].api;
    let promise = this[kAssets].metadataPromise;
    if (promise) {
      return promise;
    }
    this[kAssets].metadataPromise = promise = lastValueFrom(
        this._sendRequest<any>(
            HttpObserveType.Body,
            new HttpRequest({
              method: 'GET',
              url: '',
              headers: new Headers({'accept': 'application/json'})
            })
        )
    );
    return await promise
        .then(async (body) => {
          if (!body)
            throw new Error(`No response returned.`);
          const api = await ApiDocumentFactory.createDocument(body);
          this[kAssets].api = api;
          return api;
        })
        .catch((e) => {
          e.message = 'Unable to fetch metadata from service url (' + this.serviceUrl + '). ' + e.message
          throw e;
        })
        .finally(() => delete this[kAssets].metadataPromise);
  }

  // batch(requests: HttpRequestHost<any>[]): BatchRequest {
  // this._assertMetadata();
  // return new BatchRequest(request => this._sendRequest('response', request, requests);
  // }

  collection<TType = any>(resourceName: string | Type<TType>): HttpCollectionNode<TType> {
    // If name argument is a class, we extract name from the class
    if (typeof resourceName === 'function')
      resourceName = resourceName.name;
    const ctx: HttpClientContext = {
      client: this,
      sourceKind: 'Collection',
      endpoint: '',
      resource: resourceName,
      send: (observe, request) =>
          this._sendRequest(observe, request, 'Collection', ctx.endpoint, ctx),
      // requestInterceptors: [
      //   // Validate resource exists and is a collection resource
      //   async () => {
      //     const metadata = await this.getMetadata();
      //     metadata.getCollection(ctx.sourceName);
      //   }
      // ],
      responseInterceptors: []
    }
    return new HttpCollectionNode<TType>(ctx);
  }

  singleton<TType = any>(sourceName: string | Type<TType>): HttpSingletonNode<TType> {
    // If name argument is a class, we extract name from the class
    if (typeof sourceName === 'function')
      sourceName = sourceName.name;
    const ctx: HttpClientContext = {
      client: this,
      sourceKind: 'Singleton',
      endpoint: '',
      resource: sourceName,
      send: (observe, request) =>
          this._sendRequest(observe, request, 'Singleton', ctx.endpoint, ctx),
      // requestInterceptors: [
      //   // Validate resource exists and is a singleton resource
      //   async () => {
      //     const metadata = await this.getMetadata();
      //     metadata.getSingleton(ctx.sourceName);
      //   }
      // ],
      responseInterceptors: []
    }
    return new HttpSingletonNode<TType>(ctx);
  }

  protected _sendRequest<TBody>(
      observe: HttpObserveType,
      request: HttpRequest,
      sourceKind?: OpraSchema.Resource.Kind,
      endpoint?: string,
      ctx?: HttpClientContext
  ): Observable<HttpResponse<TBody> | TBody | HttpEvent> {
    return new Observable(subscriber => {
      (async () => {
        request.inset(this.defaults);
        const url = new OpraURL(request.url, this.serviceUrl);
        let body: any;
        if (request.body) {
          let contentType;
          if (typeof request.body === 'string' || typeof request.body === 'number' || typeof request.body === 'boolean') {
            contentType = 'text/plain;charset=UTF-8"';
            body = String(request.body);
            request.headers.delete('Content-Size');
            delete request.duplex;
          } else if (isReadableStreamLike(request.body)) {
            contentType = 'application/octet-stream';
            body = request.body;
            request.duplex = 'half';
          } else if (Buffer.isBuffer(request.body)) {
            contentType = 'application/octet-stream';
            body = request.body;
            request.headers.set('Content-Size', String(request.body.length));
            delete request.duplex;
          } else if (isBlob(request.body)) {
            contentType = request.body.type || 'application/octet-stream';
            body = request.body;
            request.headers.set('Content-Size', String(request.body.length));
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
        if (ctx) {
          const requestInterceptors = [
            ...this[kAssets].requestInterceptors,
            ...(ctx.requestInterceptors || [])];
          for (const interceptor of requestInterceptors) {
            await interceptor(ctx, request);
          }
        }
        if (observe === HttpObserveType.Events)
          subscriber.next({
            observe,
            request,
            event: HttpEventType.Sent,
          } satisfies HttpSentEvent);
        const response = await this._fetch(url.toString(), request);
        await this._handleResponse(observe, subscriber, request, response, sourceKind, endpoint, ctx);
      })().catch(error => subscriber.error(error))
    });
  }

  protected _fetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, init);
  }

  protected _createResponse(init?: HttpResponse.Initiator): HttpResponse {
    return new HttpResponse<any>(init);
  }

  protected async _handleResponse(
      observe: HttpObserveType,
      subscriber: Subscriber<any>,
      request: HttpRequest,
      fetchResponse: Response,
      sourceKind?: OpraSchema.Resource.Kind,
      endpoint?: string,
      ctx?: HttpClientContext
  ): Promise<void> {
    const headers = fetchResponse.headers;

    if (observe === HttpObserveType.Events) {
      const response = this._createResponse({
        url: fetchResponse.url,
        headers,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        hasBody: !!fetchResponse.body
      })
      subscriber.next({
        observe,
        request,
        event: HttpEventType.ResponseHeader,
        response
      } satisfies HttpResponseHeaderEvent);
    }

    let body: any;
    let totalCount: number | undefined;
    let affected: number | undefined;
    const contentType = headers.get('Content-Type') || '';
    if (fetchResponse.body) {
      if (JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
        body = await fetchResponse.json();
        if (typeof body === 'string')
          body = JSON.parse(body);
        if (OPRA_JSON_CONTENT_TYPE_PATTERN.test(contentType)) {
          totalCount = body.totalCount;
          affected = body.affected;
        }
      } else if (TEXT_CONTENT_TYPE_PATTERN.test(headers.get('Content-Type') || ''))
        body = await fetchResponse.text();
      else if (FORMDATA_CONTENT_TYPE_PATTERN.test(headers.get('Content-Type') || ''))
        body = await fetchResponse.formData();
      else {
        const buf = await fetchResponse.arrayBuffer();
        if (buf.byteLength)
          body = buf;
      }
    }

    if (observe === HttpObserveType.Body && fetchResponse.status >= 400 && fetchResponse.status < 600) {
      subscriber.error(new ClientError({
        message: fetchResponse.status + ' ' + fetchResponse.statusText,
        status: fetchResponse.status,
        issues: body?.errors
      }));
      subscriber.complete();
      return;
    }

    const responseInit: HttpResponse.Initiator = {
      url: fetchResponse.url,
      headers,
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      body
    }

    if (totalCount != null)
      responseInit.totalCount = totalCount;
    if (affected != null)
      responseInit.affected = affected;

    const response = this._createResponse(responseInit);

    if (ctx) {
      const responseInterceptors = [
        ...this[kAssets].responseInterceptors,
        ...(ctx.responseInterceptors || [])];
      for (const interceptor of responseInterceptors) {
        await interceptor(ctx, observe, request);
      }
    }

    if (observe === HttpObserveType.Body) {
      if (OPRA_JSON_CONTENT_TYPE_PATTERN.test(contentType))
        subscriber.next(body.data);
      else subscriber.next(body);
    } else {
      if (observe === HttpObserveType.Events)
        subscriber.next({
          observe,
          request,
          event: HttpEventType.Response,
          response
        } satisfies HttpResponseEvent);
      else
        subscriber.next(response);
    }
    subscriber.complete();
  }

}
