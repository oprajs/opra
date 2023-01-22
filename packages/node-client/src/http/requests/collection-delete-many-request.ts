import {
  CollectionDeleteManyQueryOptions,
  CollectionResourceInfo, HttpResponse,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler, } from '../http-types.js';

export class CollectionDeleteManyRequest<T, TResponse extends HttpResponse<never>> extends HttpRequestHost<T, never, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      options?: CollectionDeleteManyQueryOptions & CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'DELETE';
    request.url = this.resource.name;
    if (options?.filter)
      request.params.set('$filter', options.filter);
  }

}
