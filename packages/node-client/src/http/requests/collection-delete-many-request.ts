import {
  CollectionDeleteManyQueryOptions,
  CollectionResourceInfo, OpraURLSearchParams,
} from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionDeleteManyRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequestBuilder<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public options: CollectionDeleteManyQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    const searchParams = new OpraURLSearchParams();
    if (this.options.filter)
      searchParams.set('$filter', this.options.filter);
    return mergeRawHttpRequests({
          method: 'DELETE',
          path: this.resource.name,
          params: searchParams,
        },
        this.options.http
    );
  }
}
