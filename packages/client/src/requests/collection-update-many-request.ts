import { AxiosRequestConfig } from 'axios';
import { CollectionResourceInfo, CollectionUpdateManyQueryOptions } from '@opra/schema';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions, PartialInput } from '../types.js';

export class CollectionUpdateManyRequest<T, TResponse extends ClientResponse<T>>
    extends OpraClientRequest<T, TResponse> {
  constructor(
      readonly client: OpraClient,
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      readonly resource: CollectionResourceInfo,
      public data: PartialInput<T>,
      public options: CollectionUpdateManyQueryOptions & CommonQueryOptions = {}
  ) {
    super(client, send, options);
  }

  prepare(): AxiosRequestConfig {
    const url = new OpraURL(this.client.serviceUrl);
    url.path.join(this.resource.name);
    if (this.options.filter)
      url.searchParams.set('$filter', this.options.filter);
    return {
      method: 'PATCH',
      url: url.address,
      data: this.data,
      params: url.searchParams
    }
  }

}
