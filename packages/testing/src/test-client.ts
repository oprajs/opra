import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { Type } from 'ts-gems';
import { URL } from 'url';
import { HttpResponse, HttpResponseInit, joinPath } from '@opra/common';
import {
  HttpCollectionNode, HttpSingletonNode,
  // BatchRequest,
  OpraHttpClient,
  OpraHttpClientOptions,
} from '@opra/node-client';
import { ApiExpect } from './api-expect/api-expect.js';
import { isAbsoluteUrl } from './utils/is-absolute-url.util.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void

export type ResponseExt = { expect: ApiExpect };

export class OpraTestClient extends OpraHttpClient {
  protected _server: Server;

  constructor(app: Server | RequestListener, options?: OpraHttpClientOptions) {
    super('/', options);
    this._server = app instanceof Server ? app : createServer(app);
  }

  collection<TType = any>(resourceName: string | Type<TType>): HttpCollectionNode<TType, ResponseExt> {
    return super.collection(resourceName);
  }

  singleton<TType = any>(resourceName: string | Type<TType>): HttpSingletonNode<TType, ResponseExt> {
    return super.singleton(resourceName);
  }

  protected async _fetch(urlString: string, req: RequestInit = {}): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
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
          return resolve(res);
        this._server.once('close', () => resolve(res));
        this._server.close();
        this._server.unref();
      }).then()
          .catch(error => {
            if (!this._server.listening)
              return reject(error);
            this._server.once('close', () => reject(error));
            this._server.close();
            this._server.unref();
          });
    });
  }

  protected _createResponse(init?: HttpResponseInit): HttpResponse {
    const resp = super._createResponse(init) as HttpResponse & ResponseExt;
    resp.expect = new ApiExpect(resp);
    return resp;
  }

}
