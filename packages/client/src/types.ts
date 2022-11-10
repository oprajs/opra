import { AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';

export type ObservablePromiseLike<T> = Observable<T> & PromiseLike<T>;

export { PartialInput, PartialOutput } from '@opra/common';
export type ResponseHeaders = Partial<Record<string, string | string[]>>;

export type CommonRequestOptions = {
  headers?: Record<string, string>;
  validateStatus?: boolean | ((status: number) => boolean);
}

export type RequestConfig = AxiosRequestConfig & CommonRequestOptions;

// export type CollectionCreateRequestOptions = CollectionCreateQueryOptions & CommonRequestOptions;
// export type CollectionDeleteRequestOptions = CommonRequestOptions;
// export type CollectionDeleteManyRequestOptions = CollectionDeleteManyQueryOptions & CommonRequestOptions;
// export type CollectionGetRequestOptions = CollectionGetQueryOptions & CommonRequestOptions;
// export type CollectionUpdateRequestOptions = CollectionUpdateQueryOptions & CommonRequestOptions;
// export type CollectionUpdateManyRequestOptions = CollectionUpdateManyQueryOptions & CommonRequestOptions;
// export type CollectionSearchRequestOptions = CollectionSearchQueryOptions & CommonRequestOptions;
//
// export type SingletonGetRequestOptions = SingletonGetQueryOptions & CommonRequestOptions;