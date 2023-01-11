import { CollectionResourceInfo, OpraURLPath } from '@opra/common';
import { HttpRequestBuilder } from '../http-request-builder.js';
import { HttpResponse } from '../http-response.js';
import { CommonHttpRequestOptions, HttpRequestHandler, RawHttpRequest } from '../http-types.js';
import { mergeRawHttpRequests } from '../utils/merge-raw-http-requests.util.js';

export class CollectionDeleteRequest<T, TResponse extends HttpResponse<T> = HttpResponse<T>> extends HttpRequestBuilder<T, TResponse> {
  constructor(
      protected _handler: HttpRequestHandler,
      readonly resource: CollectionResourceInfo,
      public keyValue: any,
      public options: CommonHttpRequestOptions = {}
  ) {
    super(_handler, options);
  }

  prepare(): RawHttpRequest {
    if (this.keyValue == null || this.keyValue === '')
      throw new TypeError('Key value required to perform "delete" request');
    const path = new OpraURLPath({resource: this.resource.name, key: this.keyValue});
    return mergeRawHttpRequests({
          method: 'DELETE',
          path: path.toString(),
        },
        this.options.http
    );
  }
}
