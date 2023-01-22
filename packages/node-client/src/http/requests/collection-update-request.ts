import {
  CollectionResourceInfo,
  CollectionUpdateQueryOptions, HttpResponse,
  PartialInput,
} from '@opra/common';
import { HttpRequestHost } from '../http-request-host.js';
import { CommonHttpRequestOptions, HttpRequestHandler } from '../http-types.js';

export class CollectionUpdateRequest<T, TType, TResponse extends HttpResponse<TType>> extends HttpRequestHost<T, TType, TResponse> {

  constructor(
      handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      id: any,
      data: PartialInput<TType>,
      options?: CollectionUpdateQueryOptions & CommonHttpRequestOptions
  ) {
    super(handler, options);
    const request = this[HttpRequestHost.kRequest];
    request.method = 'PATCH';
    request.path.join({resource: this.resource.name, key: id});
    request.body = data;
    if (options?.include)
      request.params.set('$include', options.include);
    if (options?.pick)
      request.params.set('$pick', options.pick);
    if (options?.omit)
      request.params.set('$omit', options.omit);
  }

}
