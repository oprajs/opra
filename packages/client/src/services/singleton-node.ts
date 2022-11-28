import { AxiosRequestConfig } from 'axios';
import { SingletonGetQueryOptions, SingletonResourceInfo } from '@opra/schema';
import type { OpraClient } from '../client.js';
import { SingletonGetRequest } from '../requests/singleton-get-request.js';
import { ClientResponse } from '../types.js';

export class SingletonNode<T, TResponse extends ClientResponse<T>> {

  constructor(
      readonly client: OpraClient,
      readonly resource: SingletonResourceInfo,
      protected _send: (req: AxiosRequestConfig) => Promise<TResponse>,
  ) {
  }

  get(options?: SingletonGetQueryOptions) {
    return new SingletonGetRequest<T, TResponse>(this.client, this._send, this.resource, options);
  }

}
