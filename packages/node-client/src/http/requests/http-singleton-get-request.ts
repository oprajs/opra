import { SingletonGetQueryOptions, SingletonResourceInfo } from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class HttpSingletonGetRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequestBuilder<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: SingletonResourceInfo,
      public options: SingletonGetQueryOptions & CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    const searchParams = new URLSearchParams();
    if (this.options.include)
      searchParams.set('$include', '' + this.options.include);
    if (this.options.pick)
      searchParams.set('$pick', '' + this.options.pick);
    if (this.options.omit)
      searchParams.set('$omit', '' + this.options.omit);
    return mergeRawHttpRequests({
          method: 'GET',
          path: this.resource.name,
          params: searchParams
        },
        this.options.http
    );
  }
}
