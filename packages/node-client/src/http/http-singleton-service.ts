import { SingletonGetQueryOptions, SingletonResourceInfo } from '@opra/common';
import { HttpResponse } from './http-response.js';
import { HttpRequestHandler } from './http-types.js';
import { HttpSingletonGetRequest } from './requests/http-singleton-get-request.js';

export class HttpSingletonService<T, TResponse extends HttpResponse<T> = HttpResponse<T>> {

  constructor(
      readonly resource: SingletonResourceInfo,
      protected _handler: HttpRequestHandler,
  ) {
  }

  get(options?: SingletonGetQueryOptions) {
    return new HttpSingletonGetRequest<T, TResponse>(this._handler, this.resource, options);
  }

}
