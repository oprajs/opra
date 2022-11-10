import { AxiosRequestConfig } from 'axios';
import { OpraDocument, SingletonGetQueryOptions, SingletonResourceInfo } from '@opra/schema';
import { OpraURL } from '@opra/url';
import { observablePromise } from '../observable-promise.js';
import { SingletonGetRequest } from '../requests/singleton-get-request.js';
import { OpraResponse } from '../response.js';
import { ObservablePromiseLike, RequestConfig, } from '../types.js';

export class SingletonService<T, TResponse extends OpraResponse<T> = OpraResponse<T>> {

  constructor(
      protected _serviceUrl: string,
      protected _document: OpraDocument,
      protected _handler: (req: AxiosRequestConfig) => Promise<any>,
      protected _resource: SingletonResourceInfo) {
  }

  get(options?: SingletonGetQueryOptions | ((req: SingletonGetRequest) => void)): ObservablePromiseLike<TResponse> {
    const requestOptions = options && typeof options === 'object' ? options : {};
    const requestWrapper = new SingletonGetRequest(requestOptions);
    if (typeof options === 'function')
      options(requestWrapper);
    const req = this._prepareGetRequest(requestOptions);
    const promise = this._handler(req);
    return observablePromise(promise);
  }

  protected _prepareGetRequest(options: SingletonGetQueryOptions): RequestConfig {
    const url = new OpraURL(this._serviceUrl);
    url.path.join(this._resource.name);
    if (options.include)
      url.searchParams.set('$include', options.include);
    if (options.pick)
      url.searchParams.set('$pick', options.pick);
    if (options.omit)
      url.searchParams.set('$omit', options.omit);
    return {
      method: 'GET',
      url: url.address,
      params: url.searchParams
    }
  }


}
