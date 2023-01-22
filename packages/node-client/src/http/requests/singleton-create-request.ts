import {
  CollectionCreateQueryOptions, HttpResponse,
  PartialInput,
  SingletonResourceInfo
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from '../http-types.js';

export class SingletonCreateRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: SingletonResourceInfo,
      data: PartialInput<TType>,
      options?: CollectionCreateQueryOptions & CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'POST';
    request.url = this.resource.name;
    request.body = data;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
  }

}
