// @ts-ignore
import { HttpClient } from '@angular/common/http';
import { HttpClientBase, kBackend } from '@opra/client';
import { AngularBackend } from './angular-backend.js';

/**
 * Angular specific implementation of {@link HttpClientBase}.
 *
 * @class OpraAngularClient
 */
export class OpraAngularClient extends HttpClientBase<AngularBackend.RequestOptions> {
  declare [kBackend]: AngularBackend;

  /**
   * Creates a new instance of OpraAngularClient.
   *
   * @param httpClient The Angular HttpClient instance.
   * @param serviceUrl The base URL of the service.
   * @param options Configuration options.
   */
  constructor(
    httpClient: HttpClient,
    serviceUrl: string,
    options?: AngularBackend.Options,
  ) {
    super(new AngularBackend(httpClient, serviceUrl, options));
  }

  /**
   * Gets the default request options from the backend.
   */
  get defaults(): AngularBackend.RequestDefaults {
    return this[kBackend].defaults;
  }
}
