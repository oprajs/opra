import axios, { AxiosAdapter, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ResponsiveMap } from '@opra/common';
import { OpraDocument } from '@opra/schema';
import { joinPath, normalizePath } from '@opra/url';
import { ClientError } from './client-error.js';
import { OpraResponse } from './response.js';
import { CollectionService } from './services/collection-service.js';
import { SingletonService } from './services/singleton-service.js';
import { CommonRequestOptions, ResponseHeaders } from './types.js';

export interface OpraClientOptions {
  adapter?: AxiosAdapter;
  resetCache?: boolean;
  defaultHeaders?: Record<string, string>;
  validateStatus?: boolean | ((status: number) => boolean);
}

export class OpraClient {
  serviceUrl: string;
  options: OpraClientOptions;
  protected _metadata!: OpraDocument;

  protected constructor(
      serviceUrl: string,
      options?: OpraClientOptions) {
    this.options = {...options};
    this.serviceUrl = normalizePath(serviceUrl);
  }

  get metadata(): OpraDocument {
    return this._metadata;
  }

  collection<T = any, TResponse extends OpraResponse<T> = OpraResponse<T>>(
      name: string,
      options?: CommonRequestOptions
  ): CollectionService<T, TResponse> {
    const resource = this.metadata.getCollectionResource(name);
    const commonOptions: CommonRequestOptions = {
      headers: this.options.defaultHeaders,
      validateStatus: this.options.validateStatus,
      ...options,
    }
    return new CollectionService<T, TResponse>(
        this.serviceUrl,
        this.metadata,
        (req) => this._send(req, commonOptions),
        resource)
  }

  singleton<T = any, TResponse extends OpraResponse<T> = OpraResponse<T>>(
      name: string,
      options?: CommonRequestOptions
  ): SingletonService<T, TResponse> {
    const resource = this.metadata.getSingletonResource(name);
    const commonOptions: CommonRequestOptions = {
      headers: this.options.defaultHeaders,
      validateStatus: this.options.validateStatus,
      ...options,
    }
    return new SingletonService<T, TResponse>(
        this.serviceUrl,
        this.metadata,
        (req) => this._send(req, commonOptions),
        resource)
  }

  protected async _send(req: AxiosRequestConfig, options?: CommonRequestOptions): Promise<OpraResponse> {
    const axiosInstance = this._createAxiosInstance(options);
    const resp = await axiosInstance.request({...req, validateStatus: undefined});
    const validateStatus = options?.validateStatus
    if ((validateStatus === true && !(resp.status >= 200 && resp.status < 300)) ||
        (typeof validateStatus === 'function' && !validateStatus(resp.status))) {
      throw new ClientError({
        message: resp.statusText,
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
    };
  }

  protected _createAxiosInstance(options?: CommonRequestOptions): AxiosInstance {
    const axiosInstance = axios.create();
    axiosInstance.defaults.adapter = this.options.adapter;
    axiosInstance.defaults.headers.common = {...options?.headers, ...this.options.defaultHeaders};
    if (options?.validateStatus != null) {
      if (options.validateStatus === false)
        axiosInstance.defaults.validateStatus = () => true;
      else if (typeof options.validateStatus === 'function')
        axiosInstance.defaults.validateStatus = options.validateStatus;
    } else if (this.options.validateStatus != null) {
      if (this.options.validateStatus === false)
        axiosInstance.defaults.validateStatus = () => true;
      else if (typeof this.options.validateStatus === 'function')
        axiosInstance.defaults.validateStatus = this.options.validateStatus;
    }
    return axiosInstance;
  }

  protected async _fetchMetadata(): Promise<void> {
    const resp = await this._send({
      method: 'GET',
      url: joinPath(this.serviceUrl || '/', '$metadata'),
    }, {validateStatus: true});
    this._metadata = new OpraDocument(resp.data);
  }

  static async create(serviceUrl: string, options?: OpraClientOptions): Promise<OpraClient> {
    const client = new this(serviceUrl, options);
    await client._fetchMetadata();
    return client;
  }

}
