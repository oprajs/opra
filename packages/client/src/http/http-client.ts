import { kBackend } from '../constants.js';
import { FetchBackend } from './fetch-backend.js';
import { HttpClientBase } from './http-client-base.js';

/**
 * Default implementation of {@link HttpClientBase} using {@link FetchBackend}.
 *
 * @class OpraHttpClient
 */
export class OpraHttpClient extends HttpClientBase<FetchBackend.RequestOptions> {
  declare [kBackend]: FetchBackend;

  /**
   * Creates a new instance of OpraHttpClient.
   *
   * @param serviceUrl The base URL of the service.
   * @param options Configuration options.
   */
  constructor(serviceUrl: string, options?: FetchBackend.Options) {
    super(new FetchBackend(serviceUrl, options));
  }

  /**
   * Gets the default request options from the backend.
   */
  get defaults(): FetchBackend.RequestDefaults {
    return this[kBackend].defaults;
  }
}
