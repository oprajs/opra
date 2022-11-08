import { CollectionResourceInfo } from '@opra/schema';
import { ResourceKey } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { CollectionCreateRequest } from '../requests/collection-create-request.js';
import { CollectionDeleteManyRequest } from '../requests/collection-delete-many-request.js';
import { CollectionDeleteRequest } from '../requests/collection-delete-request.js';
import { CollectionGetRequest } from '../requests/collection-get-request.js';
import { CollectionSearchRequest } from '../requests/collection-search-request.js';
import { CollectionUpdateManyRequest } from '../requests/collection-update-many-request.js';
import { CollectionUpdateRequest } from '../requests/collection-update-request.js';
import { OpraResponse } from '../response.js';
import {
  CollectionCreateRequestOptions,
  CollectionDeleteManyRequestOptions,
  CollectionDeleteRequestOptions,
  CollectionGetRequestOptions,
  CollectionSearchRequestOptions,
  CollectionUpdateRequestOptions,
  PartialInput,
} from '../types.js';

export class CollectionService<T, TResponse extends OpraResponse<T> = OpraResponse<T>> {

  constructor(protected context: Context<T, TResponse>, protected _resource: CollectionResourceInfo) {
  }

  create(data: PartialInput<T>, options?: CollectionCreateRequestOptions): CollectionCreateRequest<T, TResponse> {
    return new CollectionCreateRequest<T, TResponse>(this.context, this._resource, data, options);
  }

  delete(keyValue: ResourceKey, options?: CollectionDeleteRequestOptions): CollectionDeleteRequest<T, TResponse> {
    return new CollectionDeleteRequest<T, TResponse>(this.context, this._resource, keyValue, options);
  }

  deleteMany(options?: CollectionDeleteManyRequestOptions): CollectionDeleteManyRequest<T, TResponse> {
    return new CollectionDeleteManyRequest<T, TResponse>(this.context, this._resource, options);
  }

  get(keyValue: ResourceKey, options?: CollectionGetRequestOptions): CollectionGetRequest<T, TResponse> {
    return new CollectionGetRequest<T, TResponse>(this.context, this._resource, keyValue, options);
  }

  search(options?: CollectionSearchRequestOptions): CollectionSearchRequest<T, TResponse> {
    return new CollectionSearchRequest<T, TResponse>(this.context, this._resource, options);
  }

  update(keyValue: ResourceKey, data: PartialInput<T>, options?: CollectionUpdateRequestOptions): CollectionUpdateRequest<T, TResponse> {
    return new CollectionUpdateRequest<T, TResponse>(this.context, this._resource, keyValue, data, options);
  }

  updateMany(data: PartialInput<T>, options?: CollectionUpdateRequestOptions): CollectionUpdateManyRequest<T, TResponse> {
    return new CollectionUpdateManyRequest<T, TResponse>(this.context, this._resource, data, options);
  }

}
