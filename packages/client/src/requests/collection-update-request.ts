import { CollectionResourceInfo } from '@opra/schema';
import { OpraURL, ResourceKey } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CollectionUpdateRequestOptions, PartialInput, RequestConfig } from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionUpdateRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _keyValue: ResourceKey,
              protected _data: PartialInput<T>,
              protected _options: CollectionUpdateRequestOptions = {}
  ) {
    super(context, _options);
  }

  keyValue(value: ResourceKey): this {
    this._keyValue = value;
    return this;
  }

  omit(...fields: (string | string[])[]): this {
    this._options.omit = fields.flat();
    return this;
  }

  pick(...fields: (string | string[])[]): this {
    this._options.pick = fields.flat();
    return this;
  }

  include(...fields: (string | string[])[]): this {
    this._options.include = fields.flat();
    return this;
  }

  protected _prepare(): RequestConfig {
    const url = new OpraURL(this.context.serviceUrl);
    url.path.join(this._resource.name);
    url.path.get(url.path.size - 1).key = this._keyValue;
    if (this._options.include)
      url.searchParams.set('$include', this._options.include);
    if (this._options.pick)
      url.searchParams.set('$pick', this._options.pick);
    if (this._options.omit)
      url.searchParams.set('$omit', this._options.omit);
    return {
      method: 'PATCH',
      url: url.address,
      data: this._data,
      params: url.searchParams
    }
  }

}

