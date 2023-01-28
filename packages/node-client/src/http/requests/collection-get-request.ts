import {
  CollectionGetQueryOptions,
  HttpResponse,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpClientContext } from '../http-types.js';

export class CollectionGetRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      context: HttpClientContext,
      id: any,
      options?: CollectionGetQueryOptions & CommonHttpRequestOptions
  ) {
    super(context, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'GET';
    request.path.join({resource: context.resourceName, key: id});
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
  }

}
