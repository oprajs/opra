import { CollectionResourceInfo } from '@opra/schema';
import { Expression, OpraURL } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import {
  CollectionUpdateManyRequestOptions,
  PartialInput,
  RequestConfig
} from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionUpdateManyRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _data: PartialInput<T>,
              protected _options: CollectionUpdateManyRequestOptions = {}
  ) {
    super(context, _options);
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
    return this;
  }

  protected _prepare(): RequestConfig {
    const url = new OpraURL(this.context.serviceUrl);
    url.path.join(this._resource.name);
    if (this._options.filter)
      url.searchParams.set('$filter', this._options.filter);
    return {
      method: 'PATCH',
      url: url.address,
      data: this._data,
      params: url.searchParams
    }
  }

}

