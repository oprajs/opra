import { Type } from 'ts-gems';
import { isReadable, isReadableStream, joinPath, OpraDocument } from '@opra/common';
import { ClientError } from '../client-error.js';
import {
  FORMDATA_CONTENT_TYPE_PATTERN,
  JSON_CONTENT_TYPE_PATTERN,
  TEXT_CONTENT_TYPE_PATTERN
} from '../constants.js';
import { HttpCollectionService } from './http-collection-service.js';
import { HttpRequest } from './http-request.js';
import { HttpResponse } from './http-response.js';
import { HttpSingletonService } from './http-singleton-service.js';
import { HttpRequestDefaults, OpraHttpClientOptions, RawHttpRequest } from './http-types.js';
import { BatchRequest } from './requests/batch-request.js';
import { mergeRawHttpRequests } from './utils/merge-raw-http-requests.util.js';

const documentCache = new Map<string, OpraDocument>();
const documentResolverCaches = new Map<string, Promise<any>>();

export class OpraHttpClient {
  protected _serviceUrl: string;
  protected _metadata?: OpraDocument;
  defaults: HttpRequestDefaults;

  constructor(serviceUrl: string, options?: OpraHttpClientOptions) {
    this._serviceUrl = serviceUrl;
    this._metadata = options?.document;
    if (!this._metadata) {
      const document = documentCache.get(this.serviceUrl.toLowerCase());
      if (document)
        this._metadata = document;
    }
    this.defaults = options?.defaults || {};
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

  batch(requests: HttpRequest[]): BatchRequest {
    this._assertMetadata();
    return new BatchRequest(req => this._handleRequest(req), requests);
  }

  collection<T = any>(name: string | Type<T>): HttpCollectionService<T> {
    this._assertMetadata();
    // If name argument is a class, we extract name from the class
    if (typeof name === 'function')
      name = name.name;
    const resource = this.metadata.getCollectionResource(name);
    return new HttpCollectionService<T>(resource, req => this._handleRequest(req));
  }

  singleton<T = any>(name: string | Type<T>): HttpSingletonService<T> {
    this._assertMetadata();
    // If name argument is a class, we extract name from the class
    if (typeof name === 'function')
      name = name.name;
    const resource = this.metadata.getSingletonResource(name);
    return new HttpSingletonService<T>(resource, req => this._handleRequest(req))
  }

  protected async _resolveMetadata(): Promise<void> {
    const resp = await this._handleRequest({
      method: 'GET',
      path: '/$metadata',
      headers: {'accept': 'application/json'}
    });
    this._metadata = new OpraDocument(resp.data);
  }

  protected async _handleRequest<TResponse extends HttpResponse = HttpResponse>(req: RawHttpRequest): Promise<TResponse> {
    mergeRawHttpRequests(req, this.defaults);
    let url = joinPath(this.serviceUrl, req.path);
    if (req.params)
      url += '?' + req.params.toString();
    if (req.body) {
      if (typeof req.body === 'object') {
        if (!(isReadable(req.body) || isReadableStream(req.body) || Buffer.isBuffer(req.body))) {
          if (!req.headers?.['content-type']) {
            req.headers = req.headers || {};
            req.headers['content-type'] = 'application/json';
          }
          req.body = JSON.stringify(req.body);
        }
      }
    }
    return this._fetch(url, req as RequestInit);
  }

  protected async _fetch<TResponse extends HttpResponse = HttpResponse>(url: string, req: RequestInit): Promise<TResponse> {
    const resp = await fetch(url, req);
    let data;
    if (resp.body) {
      if (JSON_CONTENT_TYPE_PATTERN.test(resp.headers.get('Content-Type') || '')) {
        data = await resp.json();
        if (typeof data === 'string')
          data = JSON.parse(data);
      } else if (TEXT_CONTENT_TYPE_PATTERN.test(resp.headers.get('Content-Type') || ''))
        data = await resp.text();
      else if (FORMDATA_CONTENT_TYPE_PATTERN.test(resp.headers.get('Content-Type') || ''))
        data = await resp.formData();
      else data = await resp.arrayBuffer();
    }

    if (resp.status >= 400 && resp.status < 600) {
      throw new ClientError({
        message: resp.status + ' ' + resp.statusText,
        status: resp.status,
        issues: data?.errors
      });
    }
    const out: HttpResponse = {
      get headers() {
        return resp.headers
      },
      get ok() {
        return resp.ok
      },
      get redirected() {
        return resp.redirected
      },
      get status() {
        return resp.status
      },
      get statusText() {
        return resp.statusText
      },
      get type() {
        return resp.type
      },
      get url() {
        return resp.url
      },
      get contentId() {
        return resp.headers.get('Content-ID');
      },
      get data() {
        return data;
      }
    }
    return out as TResponse;
  }


  protected _assertMetadata() {
    if (!this._metadata)
      throw new Error('You must call init() to before using the client instance');
  }

  static async create<T extends OpraHttpClient>(this: Type<T>, serviceUrl: string, options?: OpraHttpClientOptions): Promise<T> {
    const client = new this(serviceUrl, options);
    if (!client._metadata)
      await client.init();
    return client as T;
  }

}
