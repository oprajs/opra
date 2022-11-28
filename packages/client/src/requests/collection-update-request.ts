import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo, CollectionUpdateQueryOptions } from '@opra/schema';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions, PartialInput } from '../types.js';

export class CollectionUpdateRequest<T, TResponse extends ClientResponse<T>>
    extends OpraClientRequest<T, TResponse> {
  constructor(
      readonly client: OpraClient,
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      readonly resource: CollectionResourceInfo,
      public keyValue: any,
      public data: PartialInput<T>,
      public options: CollectionUpdateQueryOptions & CommonQueryOptions = {}
  ) {
    super(client, send, options);
  }

  prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.client.serviceUrl);
    url.path.join(this.resource.name);
    url.path.get(url.path.size - 1).key = this.keyValue;
    if (this.options.include)
      url.searchParams.set('$include', this.options.include);
    if (this.options.pick)
      url.searchParams.set('$pick', this.options.pick);
    if (this.options.omit)
      url.searchParams.set('$omit', this.options.omit);
    return {
      method: 'PATCH',
      url: url.address,
      data: this.data,
      params: url.searchParams
    }
  }
}
