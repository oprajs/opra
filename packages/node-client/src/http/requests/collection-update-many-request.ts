import {
  CollectionResourceInfo,
  CollectionUpdateManyQueryOptions, HttpResponse,
  PartialInput,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from '../http-types.js';

export class CollectionUpdateManyRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      data: PartialInput<TType>,
      options?: CollectionUpdateManyQueryOptions & CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'PATCH';
    request.url = this.resource.name;
    request.body = data;
    if (options?.filter)
      request.params.set('$filter', options.filter);
  }

}
