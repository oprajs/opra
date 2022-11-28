import axios, {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig, AxiosResponse,
} from 'axios';
import { TaskQueue } from 'power-tasks';
import { Type } from 'ts-gems';
import { ResponsiveMap } from '@opra/common';
import { OpraDocument } from '@opra/schema';
import { normalizePath } from '@opra/url';
import { ClientError } from './client-error.js';
import { OpraClientRequest } from './client-request.js';
import { BatchRequest } from './requests/batch-request.js';
import { CollectionNode } from './services/collection-node.js';
import { SingletonNode } from './services/singleton-node.js';
import { ClientAdapter, ClientResponse, HttpRequestOptions, ResponseHeaders } from './types.js';

export interface OpraClientOptions {
  adapter?: ClientAdapter;
  defaults?: HttpRequestOptions;
  invalidateCache?: boolean;
  concurrency?: number;
  maxQueue?: number;
}

const documentCache = new Map<string, OpraDocument>();
const documentCacheResolvers = new Map<string, Promise<any>>();

export class OpraClient {
  protected _axios: AxiosInstance;
  protected _metadata!: OpraDocument;
  protected _taskQueue: TaskQueue;

  constructor(serviceUrl: string, options?: OpraClientOptions)
  constructor(serviceUrl: string, metadata: OpraDocument, options?: OpraClientOptions)
  constructor(serviceUrl: string, arg1, arg2?) {
    let options: OpraClientOptions | undefined;
    if (arg1 instanceof OpraDocument) {
      this._metadata = arg1;
      options = arg2;
    } else options = arg1 || arg2;

    this._taskQueue = new TaskQueue({
      maxQueue: options?.maxQueue,
      concurrency: options?.concurrency
    });
    this._axios = axios.create();
    this._axios.defaults.baseURL = normalizePath(serviceUrl);
    this._axios.defaults.adapter = options?.adapter;
    if (options?.defaults?.headers)
      this._axios.defaults.headers.common = options.defaults.headers;
    this._axios.defaults.auth = options?.defaults?.auth;
    this._axios.defaults.timeout = options?.defaults?.timeout;
    this._axios.defaults.timeoutErrorMessage = options?.defaults?.timeoutErrorMessage;
    this._axios.defaults.xsrfCookieName = options?.defaults?.xsrfCookieName;
    this._axios.defaults.xsrfHeaderName = options?.defaults?.xsrfHeaderName;
    this._axios.defaults.maxRedirects = options?.defaults?.maxRedirects;
    this._axios.defaults.maxRate = options?.defaults?.maxRate;
    this._axios.defaults.httpAgent = options?.defaults?.httpAgent;
    this._axios.defaults.httpsAgent = options?.defaults?.httpsAgent;
    this._axios.defaults.proxy = options?.defaults?.proxy;
    this._axios.defaults.validateStatus = options?.defaults?.validateStatus;
    const document = documentCache.get(serviceUrl.toLowerCase());
    if (document)
      this._metadata = document;
  }

  get requestInterceptors(): AxiosInterceptorManager<AxiosRequestConfig> {
    return this._axios.interceptors.request;
  }

  get responseInterceptors(): AxiosInterceptorManager<AxiosResponse> {
    return this._axios.interceptors.response;
  }

  get serviceUrl(): string {
    return this._axios.defaults.baseURL || '';
  }

  get initialized(): boolean {
    return !!this._metadata;
  }

  get metadata(): OpraDocument {
    this._assertMetadata();
    return this._metadata;
  }

  async init(): Promise<void> {
    let promise = documentCacheResolvers.get(this.serviceUrl.toLowerCase());
    if (promise) {
      await promise;
      return;
    }
    promise = this._send({
      method: 'GET',
      url: '/$metadata',
    });
    documentCacheResolvers.set(this.serviceUrl.toLowerCase(), promise);
    try {
      const resp = await promise;
      this._metadata = new OpraDocument(resp.data);
    } finally {
      documentCacheResolvers.delete(this.serviceUrl.toLowerCase());
    }
  }

  batch<TResponse extends ClientResponse<any> = ClientResponse<any>>(requests: OpraClientRequest[]): OpraClientRequest<any, TResponse> {
    this._assertMetadata();
    return new BatchRequest(this, requests, req => this._send(req));
  }

  collection<T = any, TResponse extends ClientResponse<T> = ClientResponse<T>>(name: string): CollectionNode<T, TResponse> {
    this._assertMetadata();
    const resource = this.metadata.getCollectionResource(name);
    return new CollectionNode<T, TResponse>(this, resource, req => this._send(req));
  }

  singleton<T = any, TResponse extends ClientResponse<T> = ClientResponse<T>>(name: string): SingletonNode<T, TResponse> {
    this._assertMetadata();
    const resource = this.metadata.getSingletonResource(name);
    return new SingletonNode<T, TResponse>(this, resource, req => this._send(req))
  }

  protected async _send<TResponse extends ClientResponse>(req: AxiosRequestConfig): Promise<TResponse> {
    return this._taskQueue.enqueue<TResponse>(async () => {
      const resp = await this._axios.request({
        ...req,
        validateStatus: () => true
      });
      if ((resp.status >= 400 && resp.status < 600) &&
          (this._axios.defaults.validateStatus && !this._axios.defaults.validateStatus(resp.status))) {
        throw new ClientError({
          message: resp.status + ' ' + resp.statusText,
          status: resp.status,
          issues: resp.data.errors
        });
      }
      const rawHeaders = (typeof resp.headers.toJSON === 'function'
              ? resp.headers.toJSON()
              : {...resp.headers}
      ) as ResponseHeaders;
      const headers = new ResponsiveMap<string, string | string[]>(rawHeaders);
      return {
        status: resp.status,
        statusText: resp.statusText,
        data: resp.data,
        rawHeaders,
        headers
      } as TResponse;
    }).toPromise();
  }

  protected _assertMetadata() {
    if (!this._metadata)
      throw new Error('You must call init() to before using the client instance');
  }

  static async create<T extends OpraClient>(this: Type<T>, serviceUrl: string, options?: OpraClientOptions): Promise<T> {
    const client = new this(serviceUrl, options);
    if (!client._metadata)
      await client.init();
    return client as T;
  }

}
