import { AxiosRequestConfig } from 'axios';
import type {
  CollectionCreateQueryOptions,
  CollectionDeleteManyQueryOptions,
  CollectionGetQueryOptions,
  CollectionResourceInfo,
  CollectionSearchQueryOptions,
  CollectionUpdateManyQueryOptions,
  CollectionUpdateQueryOptions
} from '@opra/schema';
import type { OpraClient } from '../client.js';
import { CollectionCreateRequest } from '../requests/collection-create-request.js';
import { CollectionDeleteManyRequest } from '../requests/collection-delete-many-request.js';
import { CollectionDeleteRequest } from '../requests/collection-delete-request.js';
import { CollectionGetRequest } from '../requests/collection-get-request.js';
import { CollectionSearchRequest } from '../requests/collection-search-request.js';
import { CollectionUpdateManyRequest } from '../requests/collection-update-many-request.js';
import { CollectionUpdateRequest } from '../requests/collection-update-request.js';
import { ClientResponse, CommonQueryOptions, PartialInput } from '../types.js';

export class CollectionNode<T, TResponse extends ClientResponse<T>> {

  constructor(
      readonly client: OpraClient,
      readonly resource: CollectionResourceInfo,
      protected _send: (req: AxiosRequestConfig) => Promise<TResponse>,
  ) {
  }

  create(data: PartialInput<T>, options?: CollectionCreateQueryOptions & CommonQueryOptions) {
    return new CollectionCreateRequest<T, TResponse>(this.client, this._send, this.resource, data, options);
  }

  delete(keyValue: any, options?: CommonQueryOptions) {
    return new CollectionDeleteRequest<T, TResponse>(this.client, this._send, this.resource, keyValue, options);
  }

  deleteMany(options?: CollectionDeleteManyQueryOptions & CommonQueryOptions) {
    return new CollectionDeleteManyRequest<T, TResponse>(this.client, this._send, this.resource, options);
  }

  get(keyValue: any, options?: CollectionGetQueryOptions & CommonQueryOptions) {
    return new CollectionGetRequest<T, TResponse>(this.client, this._send, this.resource, keyValue, options);
  }

  search(options?: CollectionSearchQueryOptions & CommonQueryOptions) {
    return new CollectionSearchRequest<T, TResponse>(this.client, this._send, this.resource, options);
  }

  update(keyValue: any, data: PartialInput<T>, options?: CollectionUpdateQueryOptions & CommonQueryOptions) {
    return new CollectionUpdateRequest<T, TResponse>(this.client, this._send, this.resource, keyValue, data, options);
  }

  updateMany(data: PartialInput<T>, options?: CollectionUpdateManyQueryOptions & CommonQueryOptions) {
    return new CollectionUpdateManyRequest<T, TResponse>(this.client, this._send, this.resource, data, options);
  }

}
