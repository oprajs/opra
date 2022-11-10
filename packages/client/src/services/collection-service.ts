import { AxiosRequestConfig } from 'axios';
import {
  CollectionCreateQueryOptions,
  CollectionDeleteManyQueryOptions,
  CollectionGetQueryOptions,
  CollectionResourceInfo,
  CollectionSearchQueryOptions,
  CollectionUpdateManyQueryOptions,
  CollectionUpdateQueryOptions,
  OpraDocument
} from '@opra/schema';
import { OpraURL } from '@opra/url';
import { observablePromise } from '../observable-promise.js';
import { CollectionCreateRequest } from '../requests/collection-create-request.js';
import { CollectionDeleteManyRequest } from '../requests/collection-delete-many-request.js';
import { CollectionGetRequest } from '../requests/collection-get-request.js';
import { CollectionSearchRequest } from '../requests/collection-search-request.js';
import { CollectionUpdateManyRequest } from '../requests/collection-update-many-request.js';
import { CollectionUpdateRequest } from '../requests/collection-update-request.js';
import { OpraResponse } from '../response.js';
import { ObservablePromiseLike, PartialInput, RequestConfig } from '../types.js';

export class CollectionService<T, TResponse extends OpraResponse<T>> {

  constructor(
      protected _serviceUrl: string,
      protected _document: OpraDocument,
      protected _handler: (req: AxiosRequestConfig) => Promise<any>,
      protected _resource: CollectionResourceInfo,
  ) {

  }

  create(data: PartialInput<T>, options?: CollectionCreateQueryOptions | ((req: CollectionCreateRequest) => void)): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionCreateRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareCreateRequest(data, requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  delete(keyValue: any): ObservablePromiseLike<TResponse> {
    const req = this._prepareDeleteRequest(keyValue);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  deleteMany(options?: CollectionDeleteManyQueryOptions | ((req: CollectionDeleteManyRequest) => void)): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionDeleteManyRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareDeleteManyRequest(requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  get(keyValue: any, options?: CollectionGetQueryOptions | ((req: CollectionGetRequest) => void)): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionGetRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareGetRequest(keyValue, requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  search(options?: CollectionSearchQueryOptions | ((req: CollectionSearchRequest) => void)): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionSearchRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareSearchRequest(requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  update(
      keyValue: any,
      data: PartialInput<T>,
      options?: CollectionUpdateQueryOptions | ((req: CollectionUpdateRequest) => void)
  ): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionUpdateRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareUpdateRequest(keyValue, data, requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  updateMany(
      data: PartialInput<T>,
      options?: CollectionUpdateManyQueryOptions | ((req: CollectionUpdateManyRequest) => void)
  ): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new CollectionUpdateManyRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareUpdateManyRequest(data, requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  protected _prepareCreateRequest(data: any, options: CollectionCreateQueryOptions): AxiosRequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    if (options.include)
      url.searchParams.set('$include', options.include);
    if (options.pick)
      url.searchParams.set('$pick', options.pick);
    if (options.omit)
      url.searchParams.set('$omit', options.omit);
    return {
      method: 'POST',
      url: url.address,
      data,
      params: url.searchParams
    }
  }

  protected _prepareDeleteRequest(keyValue: any): AxiosRequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    url.path.get(url.path.size - 1).key = keyValue;
    return {
      method: 'DELETE',
      url: url.address,
      params: url.searchParams
    }
  }

  protected _prepareDeleteManyRequest(options: CollectionDeleteManyQueryOptions): AxiosRequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    if (options.filter)
      url.searchParams.set('$filter', options.filter);
    return {
      method: 'DELETE',
      url: url.address,
      params: url.searchParams
    }
  }


  protected _prepareGetRequest(keyValue: any, options: CollectionGetQueryOptions): RequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    url.path.get(url.path.size - 1).key = keyValue;
    if (options.include)
      url.searchParams.set('$include', options.include);
    if (options.pick)
      url.searchParams.set('$pick', options.pick);
    if (options.omit)
      url.searchParams.set('$omit', options.omit);
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }

  protected _prepareSearchRequest(options: CollectionSearchQueryOptions): AxiosRequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    if (options.include)
      url.searchParams.set('$include', options.include);
    if (options.pick)
      url.searchParams.set('$pick', options.pick);
    if (options.omit)
      url.searchParams.set('$omit', options.omit);
    if (options.sort)
      url.searchParams.set('$sort', options.sort);
    if (options.filter)
      url.searchParams.set('$filter', options.filter);
    if (options.limit != null)
      url.searchParams.set('$limit', options.limit);
    if (options.skip != null)
      url.searchParams.set('$skip', options.skip);
    if (options.count != null)
      url.searchParams.set('$count', options.count);
    if (options.distinct != null)
      url.searchParams.set('$distinct', options.distinct);
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }

  protected _prepareUpdateRequest(keyValue: any, data: any, options: CollectionUpdateQueryOptions): RequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    url.path.get(url.path.size - 1).key = keyValue;
    if (options.include)
      url.searchParams.set('$include', options.include);
    if (options.pick)
      url.searchParams.set('$pick', options.pick);
    if (options.omit)
      url.searchParams.set('$omit', options.omit);
    return {
      method: 'PATCH',
      url: url.address,
      data,
      params: url.searchParams
    }
  }

  protected _prepareUpdateManyRequest(data: any, options: CollectionUpdateManyQueryOptions): RequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    if (options.filter)
      url.searchParams.set('$filter', options.filter);
    return {
      method: 'PATCH',
      url: url.address,
      data,
      params: url.searchParams
    }
  }

}
