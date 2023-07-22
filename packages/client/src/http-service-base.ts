import { OpraHttpClient } from './client.js';

export class HttpServiceBase {

  constructor(public $client: OpraHttpClient) {
  }
}
