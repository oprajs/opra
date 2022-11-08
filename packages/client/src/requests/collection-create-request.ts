import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo } from '@opra/schema';
import { OpraURL } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CollectionCreateRequestOptions, PartialInput } from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionCreateRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _data: PartialInput<T>,
              protected _options: CollectionCreateRequestOptions = {}
  ) {
    super(context, _options);
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

  protected _prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.context.serviceUrl);
    url.path.join(this._resource.name);
    if (this._options.include)
      url.searchParams.set('$include', this._options.include);
    if (this._options.pick)
      url.searchParams.set('$pick', this._options.pick);
    if (this._options.omit)
      url.searchParams.set('$omit', this._options.omit);
    return {
      method: 'POST',
      url: url.address,
      data: this._data,
      params: url.searchParams
    }
  }

}

