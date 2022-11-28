import { AxiosRequestConfig } from 'axios';
import { SingletonGetQueryOptions, SingletonResourceInfo } from '@opra/schema';
import { OpraURL } from '@opra/url';
import type { OpraClient } from '../client.js';
import { OpraClientRequest } from '../client-request.js';
import { ClientResponse, CommonQueryOptions } from '../types.js';

export class SingletonGetRequest<T, TResponse extends ClientResponse<T>>
    extends OpraClientRequest<T, TResponse> {
  constructor(
      readonly client: OpraClient,
      send: (req: AxiosRequestConfig) => Promise<TResponse>,
      readonly resource: SingletonResourceInfo,
      public options: SingletonGetQueryOptions & CommonQueryOptions = {}
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
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }
}
