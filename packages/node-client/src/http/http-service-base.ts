import { OpraHttpClient } from './http-client.js';

export class HttpServiceBase {

  constructor(public $client: OpraHttpClient) {
  }
}
