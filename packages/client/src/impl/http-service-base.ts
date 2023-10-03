import { OpraHttpClient } from '../client.js';
import { kClient, kContext } from '../constants.js';

export class HttpServiceBase {
  [kClient]: OpraHttpClient;
  [kContext]: any = {
    resource: {},
    node: null
  };

  constructor(client: OpraHttpClient) {
    this[kClient] = client;
  }
}
