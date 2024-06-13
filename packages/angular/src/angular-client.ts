import { HttpClient } from '@angular/common/http';
import { HttpClientBase, kBackend } from '@opra/client';
import { AngularBackend } from './angular-backend';

/**
 *
 * @class OpraAngularClient
 */
export class OpraAngularClient extends HttpClientBase<AngularBackend.RequestOptions> {
  [kBackend]: AngularBackend;

  constructor(httpClient: HttpClient, serviceUrl: string, options?: AngularBackend.Options) {
    super(new AngularBackend(httpClient, serviceUrl, options));
  }

  get defaults(): AngularBackend.RequestDefaults {
    return this[kBackend].defaults;
  }
}
