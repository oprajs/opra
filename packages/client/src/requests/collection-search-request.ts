import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo } from '@opra/schema';
import { Expression, OpraURL } from '@opra/url';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CollectionSearchRequestOptions } from '../types.js';
import { BaseRequest } from './base-request.js';

export class CollectionSearchRequest<T, TResponse extends OpraResponse<T> = OpraResponse<T>> extends BaseRequest<T, TResponse> {

  constructor(protected context: Context<T, TResponse>,
              protected _resource: CollectionResourceInfo,
              protected _options: CollectionSearchRequestOptions = {}
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


  limit(value: number): this {
    this._options.limit = value;
    return this;
  }

  skip(value: number): this {
    this._options.skip = value;
    return this;
  }

  count(value: boolean = true): this {
    this._options.count = value;
    return this;
  }

  distinct(value: boolean): this {
    this._options.distinct = value;
    return this;
  }

  sort(...fields: (string | string[])[]): this {
    this._options.sort = fields.flat();
    return this;
  }

  filter(value: string | Expression): this {
    this._options.filter = value;
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
    if (this._options.sort)
      url.searchParams.set('$sort', this._options.sort);
    if (this._options.filter)
      url.searchParams.set('$filter', this._options.filter);
    if (this._options.limit != null)
      url.searchParams.set('$limit', this._options.limit);
    if (this._options.skip != null)
      url.searchParams.set('$skip', this._options.skip);
    if (this._options.count != null)
      url.searchParams.set('$count', this._options.count);
    if (this._options.distinct != null)
      url.searchParams.set('$distinct', this._options.distinct);
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }

}

