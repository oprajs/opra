import { StrictOmit } from 'ts-gems';
import {
  HttpResponse,
  SingletonGetQueryOptions,
} from '@opra/common';
import { kHttpClientContext } from '../constants.js';
import { CommonHttpRequestOptions, HttpClientContext, HttpEvent } from './http-types.js';
import { SingletonDeleteRequest } from './requests/singleton-delete-request.js';
import { SingletonGetRequest } from './requests/singleton-get-request.js';


export class HttpSingletonNode<TType, TResponseExt = any> {
  protected [kHttpClientContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kHttpClientContext] = context;
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
    return new SingletonGetRequest(this[kHttpClientContext], options);
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
    return new SingletonDeleteRequest(this[kHttpClientContext], options);
  }

}
