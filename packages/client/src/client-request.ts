import { AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';
import { uid } from 'uid';
import { HeadersMap } from '@opra/common';
import type { OpraClient } from './client.js';
import { ClientResponse, CommonQueryOptions } from './types.js';

export abstract class OpraClientRequest<T = any, TResponse extends ClientResponse<T> = ClientResponse<T>> extends Observable<TResponse> {
  readonly id: string;
  protected _promise?: Promise<TResponse>;

  protected constructor(
      readonly client: OpraClient,
      protected _send: (req: AxiosRequestConfig) => Promise<TResponse>,
      public options: CommonQueryOptions = {}
  ) {
    super((subscriber) => {
      this.execute().then(v => {
        subscriber.next(v);
        subscriber.complete();
      }).catch(e => subscriber.error(e));
    });
    this.id = uid(10);
    this.options = options;
  }

  abstract prepare(): AxiosRequestConfig;

  async toPromise(): Promise<TResponse> {
    return this.execute();
  }

  async execute(): Promise<TResponse> {
    const promise = this._promise || (this._promise = this._execute());
    return await promise;
  }

  protected async _execute(): Promise<TResponse> {
    const req = this.prepare();
    const headers = this.options.http?.headers
        ? new HeadersMap({...req.headers, ...this.options.http.headers}).toObject()
        : req.headers;
    return this._send({
      ...this.options.http,
      ...req,
      headers
    });
  }

  binding(): any {
    return {};
  }

}
