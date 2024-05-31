import { kBackend } from '../constants.js';
import { FetchBackend } from './fetch-backend.js';
import { HttpClientBase } from './http-client-base.js';

/**
 *
 * @class OpraHttpClient
 */
export class OpraHttpClient extends HttpClientBase<FetchBackend.RequestOptions> {
  [kBackend]: FetchBackend;

  constructor(serviceUrl: string, options?: FetchBackend.Options) {
    super(new FetchBackend(serviceUrl, options));
  }

  get defaults(): FetchBackend.RequestDefaults {
    return this[kBackend].defaults;
  }
}
