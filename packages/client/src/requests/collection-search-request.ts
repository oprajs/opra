import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo, CollectionSearchQueryOptions } from '@opra/schema';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions } from '../types.js';

export class CollectionSearchRequest<T, TResponse extends ClientResponse<T>>
    extends OpraClientRequest<T, TResponse> {
  constructor(
      readonly client: OpraClient,
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      readonly resource: CollectionResourceInfo,
      public options: CollectionSearchQueryOptions & CommonQueryOptions = {}
  ) {
    super(client, send, options);
  }

  prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.client.serviceUrl);
    url.path.join(this.resource.name);
    if (this.options.include)
      url.searchParams.set('$include', this.options.include);
    if (this.options.pick)
      url.searchParams.set('$pick', this.options.pick);
    if (this.options.omit)
      url.searchParams.set('$omit', this.options.omit);
    if (this.options.sort)
      url.searchParams.set('$sort', this.options.sort);
    if (this.options.filter)
      url.searchParams.set('$filter', this.options.filter);
    if (this.options.limit != null)
      url.searchParams.set('$limit', this.options.limit);
    if (this.options.skip != null)
      url.searchParams.set('$skip', this.options.skip);
    if (this.options.count != null)
      url.searchParams.set('$count', this.options.count);
    if (this.options.distinct != null)
      url.searchParams.set('$distinct', this.options.distinct);
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }
}
