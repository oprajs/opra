import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { Type } from 'ts-gems';
import { URL } from 'url';
import { joinPath } from '@opra/common';
import {
  BatchRequest,
  HttpCollectionService,
  HttpRequest,
  HttpResponse,
  HttpSingletonService,
  OpraHttpClient,
  OpraHttpClientOptions,
} from '@opra/node-client';
import { ApiExpect } from './api-expect/api-expect.js';
import { isAbsoluteUrl } from './utils/is-absolute-url.util.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void
declare type Handler = RequestListener | Server

export type TestHttpResponse<T = any> = HttpResponse<T> & { expect: ApiExpect };

export class OpraTestClient extends OpraHttpClient {
  protected _server: Server;

  constructor(app: Server | RequestListener, options?: OpraHttpClientOptions) {
    super('/', options);
    this._server = app instanceof Server ? app : createServer(app);
  }

  // @ts-ignore
  batch<TResponse extends TestHttpResponse = TestHttpResponse>(requests: HttpRequest[]): BatchRequest<TResponse>;

  // @ts-ignore
  collection<T = any, TResponse extends TestHttpResponse<T> = TestHttpResponse<T>>(name: string): HttpCollectionService<T, TResponse>;

  // @ts-ignore
  singleton<T = any, TResponse extends TestHttpResponse<T> = TestHttpResponse<T>>(name: string): HttpSingletonService<T, TResponse>;

  // @ts-ignore
  protected async _fetch<TResponse extends TestHttpResponse = TestHttpResponse>(urlString: string, req: RequestInit): Promise<TResponse> {
    const resp = await new Promise<TResponse>((resolve, reject) => {
      urlString = isAbsoluteUrl(urlString) ? urlString : joinPath('http://opra.test', urlString);
      const url = new URL(urlString);
      // Set protocol to HTTP
      url.protocol = 'http';

      // Apply original host to request header
      const headers = req.headers = (req.headers || {}) as any;
      if (url.host !== 'opra.test' && headers?.host == null)
        headers.host = url.host;

      new Promise<void>((subResolve) => {
        if (this._server.listening)
          subResolve()
        else
          this._server.listen(0, '127.0.0.1', () => subResolve());
      }).then(() => {
        const address = this._server.address() as AddressInfo;
        url.host = '127.0.0.1';
        url.port = address.port.toString();
        return super._fetch(url.toString(), req);
      }).then(res => {
        if (!this._server.listening)
          return resolve(res as TResponse);
        this._server.close(() => resolve(res as TResponse));
      }).then()
          .catch(error => {
            if (!this._server.listening)
              return reject(error);
            this._server.close(() => reject(error));
          });
    });
    resp.expect = new ApiExpect(resp);
    return resp;
  }

  static async create<T extends OpraTestClient>(this: Type<T>, app: Handler, options?: OpraHttpClientOptions): Promise<T> {
    const client = new this(app, options);
    await client.init();
    return client as T;
  }
}
