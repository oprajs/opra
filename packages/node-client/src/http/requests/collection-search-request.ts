import {
  CollectionResourceInfo,
  CollectionSearchQueryOptions,
  OpraURLSearchParams,
} from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionSearchRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequestBuilder<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public options: CollectionSearchQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    const searchParams = new OpraURLSearchParams();
    if (this.options.include)
      searchParams.set('$include', this.options.include);
    if (this.options.pick)
      searchParams.set('$pick', this.options.pick);
    if (this.options.omit)
      searchParams.set('$omit', this.options.omit);
    if (this.options.sort)
      searchParams.set('$sort', this.options.sort);
    if (this.options.filter)
      searchParams.set('$filter', this.options.filter);
    if (this.options.limit != null)
      searchParams.set('$limit', this.options.limit);
    if (this.options.skip != null)
      searchParams.set('$skip', this.options.skip);
    if (this.options.count != null)
      searchParams.set('$count', this.options.count);
    if (this.options.distinct != null)
      searchParams.set('$distinct', this.options.distinct);
    return mergeRawHttpRequests({
          method: 'GET',
          path: this.resource.name,
          params: searchParams
        },
        this.options.http
    );
  }
}
