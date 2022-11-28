import { AxiosRequestConfig } from 'axios';
import * as axiosist from 'axiosist';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { Type } from 'ts-gems';
import { ClientResponse, CollectionNode, OpraClient, OpraClientOptions } from '@opra/client';
import { SingletonNode } from '@opra/client/src/services/singleton-node';
import { OpraDocument } from '@opra/schema/src/index';
import { ApiExpect } from './api-expect/api-expect.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void
declare type Handler = RequestListener | Server

type OpraTestResponse<T = any> = ClientResponse<T> & { expect: ApiExpect };

export class OpraTestClient extends OpraClient {

  constructor(app: Handler, options?: OpraClientOptions)
  constructor(app: Handler, metadata: OpraDocument, options?: OpraClientOptions)
  constructor(app: Handler, arg1, arg2?) {
    super('/', arg1, arg2);
    this._axios.defaults.adapter = axiosist.createAdapter(app);
    this._axios.defaults.validateStatus = () => true;
  }

  // @ts-ignore
  collection<T = any, TResponse extends OpraTestResponse<T> = OpraTestResponse<T>>(name: string): CollectionNode<T, TResponse> {
    return super.collection<T, TResponse>(name) as unknown as CollectionNode<T, TResponse>;
  }

  // @ts-ignore
  singleton<T = any, TResponse extends OpraTestResponse<T> = OpraTestResponse<T>>(name: string): SingletonNode<T, TResponse> {
    return super.singleton<T, TResponse>(name) as unknown as SingletonNode<T, TResponse>;
  }

  // @ts-ignore
  protected async _send<TResponse extends OpraTestResponse>(req: AxiosRequestConfig): Promise<TResponse> {
    const resp = (await super._send(req)) as OpraTestResponse;
    resp.expect = new ApiExpect(resp);
    return resp as TResponse;
  }

  static async create<T extends OpraTestClient>(this: Type<T>, app: Handler, options?: OpraClientOptions): Promise<T> {
    const client = new this(app, options);
    await client.init();
    return client as T;
  }
}
