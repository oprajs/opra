import { StrictOmit } from 'ts-gems';
import type {
  CollectionCreateQueryOptions,
  CollectionDeleteManyQueryOptions,
  CollectionGetQueryOptions,
  CollectionSearchQueryOptions,
  CollectionUpdateManyQueryOptions,
  CollectionUpdateQueryOptions,
  HttpResponse,
  PartialInput
} from '@opra/common';
import { kHttpClientContext } from '../constants.js';
import { CommonHttpRequestOptions, HttpClientContext, HttpEvent } from './http-types.js';
import { CollectionCreateRequest } from './requests/collection-create-request.js';
import { CollectionDeleteManyRequest } from './requests/collection-delete-many-request.js';
import { CollectionDeleteRequest } from './requests/collection-delete-request.js';
import { CollectionGetRequest } from './requests/collection-get-request.js';
import { CollectionSearchRequest } from './requests/collection-search-request.js';
import { CollectionUpdateManyRequest } from './requests/collection-update-many-request.js';
import { CollectionUpdateRequest } from './requests/collection-update-request.js';

export class HttpCollectionNode<TType, TResponseExt = any> {
  protected [kHttpClientContext]: HttpClientContext;

  constructor(context: HttpClientContext) {
    this[kHttpClientContext] = context;
  }

  create(
      data: PartialInput<TType>,
      options?: CollectionCreateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionCreateRequest<TType, TType, HttpResponse<TType> & TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: CollectionCreateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionCreateRequest<HttpResponse<TType> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  create(
      data: PartialInput<TType>,
      options?: CollectionCreateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionCreateRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  create(data: PartialInput<TType>, options?: CollectionCreateQueryOptions & CommonHttpRequestOptions) {
    return new CollectionCreateRequest(this[kHttpClientContext], data, options);
  }

  delete(
      id: any,
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionDeleteRequest<never, HttpResponse<never> & TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionDeleteRequest<HttpResponse<never> & TResponseExt, HttpResponse<never> & TResponseExt>
  delete(
      id: any,
      options?: StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionDeleteRequest<HttpEvent, HttpResponse<never> & TResponseExt>
  delete(id: any, options?: CommonHttpRequestOptions) {
    return new CollectionDeleteRequest(this[kHttpClientContext], id, options);
  }

  deleteMany(
      options?: CollectionDeleteManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionDeleteManyRequest<never, HttpResponse<never> & TResponseExt>
  deleteMany(
      options?: CollectionDeleteManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionDeleteManyRequest<HttpResponse<never> & TResponseExt, HttpResponse<never> & TResponseExt>
  deleteMany(
      options?: CollectionDeleteManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionDeleteManyRequest<HttpEvent, HttpResponse<never> & TResponseExt>
  deleteMany(options?: CollectionDeleteManyQueryOptions & CommonHttpRequestOptions) {
    return new CollectionDeleteManyRequest(this[kHttpClientContext], options);
  }

  get(
      id: any,
      options?: CollectionGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionGetRequest<TType, TType, HttpResponse<TType> & TResponseExt>
  get(
      id: any,
      options?: CollectionGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionGetRequest<HttpResponse<TType> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  get(
      id: any,
      options?: CollectionGetQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionGetRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  get(id: any, options?: CollectionGetQueryOptions & CommonHttpRequestOptions) {
    return new CollectionGetRequest(this[kHttpClientContext], id, options);
  }

  search(
      options?: CollectionSearchQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionSearchRequest<TType[], TType, HttpResponse<TType> & TResponseExt>
  search(
      options?: CollectionSearchQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionSearchRequest<HttpResponse<TType[]> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  search(
      options?: CollectionSearchQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionSearchRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  search(options?: CollectionSearchQueryOptions & CommonHttpRequestOptions) {
    return new CollectionSearchRequest(this[kHttpClientContext], options);
  }

  update(
      id: any, data: PartialInput<TType>,
      options?: CollectionUpdateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionSearchRequest<TType, TType, HttpResponse<TType> & TResponseExt>
  update(
      id: any, data: PartialInput<TType>,
      options?: CollectionUpdateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionSearchRequest<HttpResponse<TType> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  update(
      id: any, data: PartialInput<TType>,
      options?: CollectionUpdateQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionSearchRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  update(id: any, data: PartialInput<TType>, options?: CollectionUpdateQueryOptions & CommonHttpRequestOptions) {
    return new CollectionUpdateRequest(this[kHttpClientContext], id, data, options);
  }

  updateMany(
      data: PartialInput<TType>,
      options?: CollectionUpdateManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe?: 'body' }
  ): CollectionSearchRequest<TType, TType, HttpResponse<TType> & TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: CollectionUpdateManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'response' }
  ): CollectionSearchRequest<HttpResponse<TType> & TResponseExt, TType, HttpResponse<TType> & TResponseExt>
  updateMany(
      data: PartialInput<TType>,
      options?: CollectionUpdateManyQueryOptions &
          StrictOmit<CommonHttpRequestOptions, 'observe'> & { observe: 'events' }
  ): CollectionSearchRequest<HttpEvent, TType, HttpResponse<TType> & TResponseExt>
  updateMany(data: PartialInput<TType>, options?: CollectionUpdateManyQueryOptions & CommonHttpRequestOptions) {
    return new CollectionUpdateManyRequest(this[kHttpClientContext], data, options);
  }

}
