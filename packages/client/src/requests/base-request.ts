import { AxiosRequestConfig } from 'axios';
import { Context } from '../interfaces/context.interface.js';
import { OpraResponse } from '../response.js';
import { CommonRequestOptions } from '../types.js';

export abstract class BaseRequest<T, TResponse extends OpraResponse<T>> implements PromiseLike<TResponse> {

  protected constructor(
      protected context: Context<T, TResponse>,
      protected _options: CommonRequestOptions
  ) {
  }

  protected abstract _prepare(): AxiosRequestConfig;

  then<TResult1 = TResponse, TResult2 = never>(
      onfulfilled?: ((value: TResponse) => (PromiseLike<TResult1> | TResult1)) | undefined | null,
      onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    const req = this._prepare();
    return this.context.handler(req, this._options).then(onfulfilled, onrejected);
  }

}

