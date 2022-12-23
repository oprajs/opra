import type {
  CollectionCreateQueryOptions,
  CollectionDeleteManyQueryOptions,
  CollectionGetQueryOptions,
  CollectionResourceInfo,
  CollectionSearchQueryOptions,
  CollectionUpdateManyQueryOptions,
  CollectionUpdateQueryOptions,
  PartialInput
} from '@opra/common';
import { HttpResponse } from './http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from './http-types.js';
import { CollectionCreateRequest } from './requests/collection-create-request.js';
import { CollectionDeleteManyRequest } from './requests/collection-delete-many-request.js';
import { CollectionDeleteRequest } from './requests/collection-delete-request.js';
import { CollectionGetRequest } from './requests/collection-get-request.js';
import { CollectionSearchRequest } from './requests/collection-search-request.js';
import { CollectionUpdateManyRequest } from './requests/collection-update-many-request.js';
import { CollectionUpdateRequest } from './requests/collection-update-request.js';

export class HttpCollectionService<T, TResponse extends HttpResponse<T> = HttpResponse<T>> {

  constructor(
      readonly resource: CollectionResourceInfo,
      protected _handler: HttpRequestHandler,
  ) {
  }

  create(data: PartialInput<T>, options?: CollectionCreateQueryOptions & CommonHttpRequestOptions) {
    return new CollectionCreateRequest<T, TResponse>(this._handler, this.resource, data, options);
  }

  delete(keyValue: any, options?: CommonHttpRequestOptions) {
    return new CollectionDeleteRequest<T, TResponse>(this._handler, this.resource, keyValue, options);
  }

  deleteMany(options?: CollectionDeleteManyQueryOptions & CommonHttpRequestOptions) {
    return new CollectionDeleteManyRequest<T, TResponse>(this._handler, this.resource, options);
  }

  get(keyValue: any, options?: CollectionGetQueryOptions & CommonHttpRequestOptions) {
    return new CollectionGetRequest<T, TResponse>(this._handler, this.resource, keyValue, options);
  }

  search(options?: CollectionSearchQueryOptions & CommonHttpRequestOptions) {
    return new CollectionSearchRequest<T, TResponse>(this._handler, this.resource, options);
  }

  update(keyValue: any, data: PartialInput<T>, options?: CollectionUpdateQueryOptions & CommonHttpRequestOptions) {
    return new CollectionUpdateRequest<T, TResponse>(this._handler, this.resource, keyValue, data, options);
  }

  updateMany(data: PartialInput<T>, options?: CollectionUpdateManyQueryOptions & CommonHttpRequestOptions) {
    return new CollectionUpdateManyRequest<T, TResponse>(this._handler, this.resource, data, options);
  }

}
