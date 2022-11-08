import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo } from '@opra/schema';
import { OpraURL, ResourceKey } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CollectionDeleteRequestOptions } from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionDeleteRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _keyValue: ResourceKey,
              protected _options: CollectionDeleteRequestOptions = {}
  ) {
    super(context, _options);
  }

  keyValue(value: ResourceKey): this {
    this._keyValue = value;
    return this;
  }

  protected _prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.context.serviceUrl);
    url.path.join(this._resource.name);
    url.path.get(url.path.size - 1).key = this._keyValue;
    return {
      method: 'DELETE',
      url: url.address,
      params: url.searchParams
    }
  }

}

