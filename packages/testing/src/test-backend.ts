import * as path from 'node:path';
import { FetchBackend, HttpResponse } from '@opra/client';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { ApiExpect } from './api-expect/api-expect.js';
import type { OpraTestClient } from './test-client.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

export type ResponseExt = { expect: ApiExpect };

/**
 *
 * @class TestBackend
 */
export class TestBackend extends FetchBackend {
  protected _server: Server;

  constructor(app: Server | RequestListener, options?: OpraTestClient.Options) {
    super(options?.basePath ? path.join('http://tempuri.org', options.basePath) : 'http://tempuri.org', options);
    this._server = app instanceof Server ? app : createServer(app);
  }

  protected send(req: Request): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const url = new URL(req.url);
      // Set protocol to HTTP
      url.protocol = 'http';

      // Apply original host to request header
      if (url.host !== 'opra.test' && req.headers.get('host') == null) req.headers.set('host', url.host);

      new Promise<void>(subResolve => {
        if (this._server.listening) subResolve();
        else this._server.listen(0, '127.0.0.1', () => subResolve());
      })
        .then(() => {
          const address = this._server.address() as AddressInfo;
          url.host = '127.0.0.1';
          url.port = address.port.toString();
          return fetch(url.toString(), req);
        })
        .then(res => {
          if (!this._server.listening) return resolve(res);
          this._server.once('close', () => resolve(res));
          this._server.close();
          this._server.unref();
        })
        .then()
        .catch(error => {
          if (!this._server.listening) return reject(error);
          this._server.once('close', () => reject(error));
          this._server.close();
          this._server.unref();
        });
    });
  }

  protected createResponse(init: HttpResponse.Initiator) {
    const response = new HttpResponse(init) as HttpResponse & ResponseExt;
    response.expect = new ApiExpect(response);
    return response;
  }
}

/**
 * @namespace TestBackend
 */
export namespace TestBackend {
  export interface Options extends FetchBackend.Options {}
}
