import { StrictOmit } from 'ts-gems';
import {
  HttpResponse,
  SingletonGetQueryOptions,
  SingletonResourceInfo
} from '@opra/common';
import { CommonHttpRequestOptions, HttpEvent, HttpRequestHandler } from './http-types.js';
import { SingletonDeleteRequest } from './requests/singleton-delete-request.js';
import { SingletonGetRequest } from './requests/singleton-get-request.js';

export class HttpSingletonService<TType, TResponseExt> {

  constructor(
      readonly resource: SingletonResourceInfo,
      protected _handler: HttpRequestHandler
  ) {
  }

  get(
      options?: SingletonGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): SingletonGetRequest<TType, TType, HttpResponse<TType> & TResponseExt>
  get(
      options?: SingletonGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): SingletonGetRequest<HttpResponse<TType> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  get(
      options?: SingletonGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): SingletonGetRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  get(options?: SingletonGetQueryOptions & CommonHttpRequestOptions) {
    return new SingletonGetRequest(this._handler, this.resource, options);
  }

  delete(
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): SingletonDeleteRequest<never, HttpResponse<never> & TResponseExt>
  delete(
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): SingletonDeleteRequest<HttpResponse<never> & TResponseExt, HttpResponse<never> & TResponseExt>
  delete(
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): SingletonDeleteRequest<HttpEvent, HttpResponse<never> & TResponseExt>
  delete(options?: CommonHttpRequestOptions) {
    return new SingletonDeleteRequest(this._handler, this.resource, options);
  }

}
