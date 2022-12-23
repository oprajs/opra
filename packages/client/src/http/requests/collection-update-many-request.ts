import {
  CollectionResourceInfo,
  CollectionUpdateManyQueryOptions,
  OpraURLSearchParams, PartialInput,
} from '@opra/common';
import { HttpRequest } from '../http-request.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionUpdateManyRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequest<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public data: PartialInput<T>,
      public options: CollectionUpdateManyQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    const searchParams = new OpraURLSearchParams();
    if (this.options.filter)
      searchParams.set('$filter', this.options.filter);
    return mergeRawHttpRequests({
          method: 'PATCH',
          path: this.resource.name,
          params: searchParams,
          body: this.data
        },
        this.options.http
    );
  }

}
