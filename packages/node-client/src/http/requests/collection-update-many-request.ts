import {
  CollectionUpdateManyQueryOptions,
  HttpResponse,
  PartialInput,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpClientContext } from '../http-types.js';

export class CollectionUpdateManyRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      context: HttpClientContext,
      data: PartialInput<TType>,
      options?: CollectionUpdateManyQueryOptions & CommonHttpRequestOptions
  ) {
    super(context, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'PATCH';
    request.url = context.resourceName;
    request.body = data;
    if (options?.filter)
      request.params.set('$filter', options.filter);
  }

}
