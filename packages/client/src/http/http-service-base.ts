import { kClient, kContext } from '../constants.js';
import { OpraHttpClient } from './http-client.js';

export class HttpServiceBase {
  [kClient]: OpraHttpClient;
  [kContext]: any = {
    resources: {},
    node: null
  };

  constructor(client: OpraHttpClient) {
    this[kClient] = client;
  }
}
