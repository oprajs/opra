import {
  CollectionDeleteManyQueryOptions,
  HttpResponse,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpClientContext } from '../http-types.js';

export class CollectionDeleteManyRequest<T, TResponse extends HttpResponse<never>> extends HttpRequestHost<T, never, TResponse> {

  constructor(
      context: HttpClientContext,
      options?: CollectionDeleteManyQueryOptions & CommonHttpRequestOptions
  ) {
    super(context, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'DELETE';
    request.url = context.resourceName;
    if (options?.filter)
      request.params.set('$filter', options.filter);
  }

}
