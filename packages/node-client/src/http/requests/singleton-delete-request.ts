import { HttpResponse } from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpClientContext } from '../http-types.js';

export class SingletonDeleteRequest<T, TResponse extends HttpResponse<never>> extends HttpRequestHost<T, never, TResponse> {

  constructor(
      context: HttpClientContext,
      options?: CommonHttpRequestOptions
  ) {
    super(context, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'DELETE';
    request.url = context.resourceName;
  }

}
