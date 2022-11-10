import { AxiosRequestConfig } from 'axios';
import * as axiosist from 'axiosist';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { CollectionService, CommonRequestOptions, OpraClient, OpraClientOptions, OpraResponse } from '@opra/client';
import { SingletonService } from '@opra/client/src/services/singleton-service';
import { ApiExpect } from './api-expect/api-expect.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void
declare type Handler = RequestListener | Server

type OpraTestResponse<T = any> = OpraResponse<T> & { expect: ApiExpect };

export class OpraTestClient extends OpraClient {

  // @ts-ignore
  collection<T = any, TResponse extends OpraTestResponse<T> = OpraTestResponse<T>>(name: string): CollectionService<T, TResponse> {
    return super.collection<T, TResponse>(name) as unknown as CollectionService<T, TResponse>;
  }

  // @ts-ignore
  singleton<T = any, TResponse extends OpraTestResponse<T> = OpraTestResponse<T>>(name: string): SingletonService<T, TResponse> {
    return super.singleton<T, TResponse>(name) as unknown as SingletonService<T, TResponse>;
  }

  protected async _send(req: AxiosRequestConfig, options: CommonRequestOptions): Promise<OpraTestResponse> {
    const resp = (await super._send(req, options)) as OpraTestResponse;
    resp.expect = new ApiExpect(resp);
    return resp;
  }

  static async create(app: Handler, options?: OpraClientOptions): Promise<OpraTestClient> {
    const instance = await super.create('/', {
      validateStatus: false,
      ...options,
      adapter: axiosist.createAdapter(app)
    });
    Object.setPrototypeOf(instance, OpraTestClient.prototype);
    return instance as unknown as OpraTestClient;
  }
}
