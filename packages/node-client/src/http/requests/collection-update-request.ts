import {
  CollectionResourceInfo,
  CollectionUpdateQueryOptions,
  OpraURLPath,
  OpraURLSearchParams,
  PartialInput,
} from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionUpdateRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequestBuilder<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public keyValue: any,
      public data: PartialInput<T>,
      public options: CollectionUpdateQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    if (this.keyValue == null || this.keyValue === '')
      throw new TypeError('Key value required to perform "get" request');
    const path = new OpraURLPath({resource: this.resource.name, key: this.keyValue});
    const searchParams = new OpraURLSearchParams();
    if (this.options.include)
      searchParams.set('$include', this.options.include);
    if (this.options.pick)
      searchParams.set('$pick', this.options.pick);
    if (this.options.omit)
      searchParams.set('$omit', this.options.omit);
    return mergeRawHttpRequests({
          method: 'PATCH',
          path: path.toString(),
          params: searchParams,
          body: this.data
        },
        this.options.http
    );
  }
}
