import {
  CollectionSearchQueryOptions,
  HttpResponse
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpClientContext } from '../http-types.js';

export class CollectionSearchRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      context: HttpClientContext,
      options?: CollectionSearchQueryOptions & CommonHttpRequestOptions
  ) {
    super(context, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'GET';
    request.url = context.resourceName;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
    if (options?.sort)
      request.params.set('$sort', options.sort);
    if (options?.filter)
      request.params.set('$filter', options.filter);
    if (options?.limit != null)
      request.params.set('$limit', options.limit);
    if (options?.skip != null)
      request.params.set('$skip', options.skip);
    if (options?.count != null)
      request.params.set('$count', options.count);
    if (options?.distinct != null)
      request.params.set('$distinct', options.distinct);
  }

}
