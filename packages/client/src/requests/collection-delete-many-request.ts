import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo } from '@opra/schema';
import { Expression, OpraURL } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CollectionDeleteManyRequestOptions } from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionDeleteManyRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _options: CollectionDeleteManyRequestOptions = {}
  ) {
    super(context, _options);
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
    return this;
  }

  protected _prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.context.serviceUrl);
    url.path.join(this._resource.name);
    if (this._options.filter)
      url.searchParams.set('$filter', this._options.filter);
    return {
      method: 'DELETE',
      url: url.address,
      params: url.searchParams
    }
  }

}

