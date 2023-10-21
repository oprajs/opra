import { kBackend } from '../constants.js';
import { FetchBackend } from './fetch-backend.js';
import { HttpClientBase } from './http-client-base.js';

/**
 *
 * @class HttpFetchClient
 */
export class HttpFetchClient<
    TRequestOptions extends FetchBackend.RequestOptions = FetchBackend.RequestOptions,
    TResponseExt = {}
> extends HttpClientBase<TRequestOptions, TResponseExt> {
  [kBackend]: FetchBackend;

  constructor(serviceUrl: string, options?: FetchBackend.Options) {
    super(new FetchBackend(serviceUrl, options));
  }

  get defaults(): FetchBackend.RequestDefaults {
    return this[kBackend].defaults;
  }

}
