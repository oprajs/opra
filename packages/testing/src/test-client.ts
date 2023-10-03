import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { OpraHttpClient } from '@opra/client';
import { OpraURL } from '@opra/common';
import { ApiExpect } from './api-expect/api-expect.js';

declare type RequestListener = (req: IncomingMessage, res: ServerResponse) => void
export const kContext = Symbol.for('kContext');

export type ResponseExt = { expect: ApiExpect };

export class OpraTestClient extends OpraHttpClient<ResponseExt> {
  protected _server: Server;

  constructor(app: Server | RequestListener, options?: OpraHttpClient.Options) {
    super('/', options);
    this._server = app instanceof Server ? app : createServer(app);
    const superCreateResponse = this[kContext].createResponse;
    const superFetch = this[kContext].fetch;
    // Overwrite "createResponse" method
    this[kContext].createResponse = (init) => {
      const resp = superCreateResponse(init) as any;
      resp.expect = new ApiExpect(resp);
      return resp;
    }
    // Overwrite "fetch" method
    this[kContext].fetch = (urlString: string, req: RequestInit = {}): Promise<Response> => {
      return new Promise<Response>((resolve, reject) => {
        const url = new OpraURL(urlString, 'http://opra.test');
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
          return superFetch(url.toString(), req);
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
    };
  }

}
