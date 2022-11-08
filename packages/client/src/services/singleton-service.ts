import { SingletonResourceInfo } from '@opra/schema';
import { Context } from '../interfaces/context.interface.js';
import { SingletonGetRequest } from '../requests/singleton-get-request.js';
import { OpraResponse } from '../response.js';
import {
  CollectionGetRequestOptions,
} from '../types.js';

export class SingletonService<T, TResponse extends OpraResponse<T> = OpraResponse<T>> {

  constructor(protected context: Context<T, TResponse>, protected _resource: SingletonResourceInfo) {
  }

  // create(data: PartialInput<T>, options?: CollectionCreateRequestOptions): CollectionCreateRequest<T, TResponse> {
  //   return new CollectionCreateRequest<T, TResponse>(this.context, this, data, options);
  // }
  //
  // delete(keyValue: ResourceKey, options?: CollectionDeleteRequestOptions): CollectionDeleteRequest<T, TResponse> {
  //   return new CollectionDeleteRequest<T, TResponse>(this.context, this, keyValue, options);
  // }

  get(options?: CollectionGetRequestOptions): SingletonGetRequest<T, TResponse> {
    return new SingletonGetRequest<T, TResponse>(this.context, this._resource, options);
  }

  //
  // update(keyValue: ResourceKey, data: PartialInput<T>, options?: CollectionUpdateRequestOptions): CollectionUpdateRequest<T, TResponse> {
  //   return new CollectionUpdateRequest<T, TResponse>(this.context, this, keyValue, data, options);
  // }

}
