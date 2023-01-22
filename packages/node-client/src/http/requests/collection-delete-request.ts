import { CollectionResourceInfo, HttpResponse } from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from '../http-types.js';

export class CollectionDeleteRequest<T, TResponse extends HttpResponse<never>> extends HttpRequestHost<T, never, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      id: any,
      options?: CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'DELETE';
    request.path.join({resource: this.resource.name, key: id});
  }

}
