import http from 'http';
import {
  ApiDocument, HttpStatusCodes, HttpStatusMessages,
  OpraURL, OpraURLPath,
} from '@opra/common';
import type { HttpAdapter } from './http-adapter';
import { HttpAdapterBase } from './http-adapter-base.js';
import { HttpServerRequest } from './http-server-request.js';
import { HttpServerResponse } from './http-server-response.js';

/**
 * @class HttpAdapterHost
 */
export class HttpAdapterHost extends HttpAdapterBase implements HttpAdapter {
  _basePath: OpraURLPath;
  _options: HttpAdapter.Options;
  _server: http.Server;

  constructor(api: ApiDocument, options?: HttpAdapter.Options) {
    super(api, options);
    this._platform = 'http';
    this._basePath = new OpraURLPath(options?.basePath);
    this._server = http.createServer(
        (incomingMessage: http.IncomingMessage, serverResponse: http.ServerResponse) =>
            this._serverListener(incomingMessage, serverResponse));
  }

  get basePath() {
    return this._basePath;
  }

  get server() {
    return this._server;
  }

  protected _serverListener(incomingMessage: http.IncomingMessage, serverResponse: http.ServerResponse) {
    const originalUrl = incomingMessage.url;
    const parsedUrl = new OpraURL(originalUrl);
    const relativePath = OpraURLPath.relative(parsedUrl.path, this.basePath);
    if (!relativePath) {
      serverResponse.statusCode = HttpStatusCodes.NOT_FOUND;
      serverResponse.statusMessage = HttpStatusMessages[HttpStatusCodes.NOT_FOUND];
      serverResponse.end();
      return;
    }
    parsedUrl.path = relativePath;
    (incomingMessage as any).originalUrl = originalUrl;
    (incomingMessage as any).baseUrl = this.basePath.toString();
    (incomingMessage as any).parsedUrl = parsedUrl;
    const req = HttpServerRequest.from(incomingMessage);
    const res = HttpServerResponse.from(serverResponse);
    this.handleIncoming(req, res)
        .catch((e) => this._logger.fatal(e));
  }

  async close() {
    await super.close();
    if (this.server.listening)
      await new Promise<void>((resolve, reject) => {
        this.server.close((err) => {
          if (err)
            return reject(err);
          resolve();
        });
      })

  }

}

