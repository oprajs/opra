import { HttpResponse, SingletonResourceInfo } from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from '../http-types.js';

export class SingletonDeleteRequest<T, TResponse extends HttpResponse<never>> extends HttpRequestHost<T, never, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: SingletonResourceInfo,
      options?: CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'DELETE';
    request.url = this.resource.name;
  }

}
