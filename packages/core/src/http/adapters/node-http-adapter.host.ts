import http from 'http';
import {
  ApiDocument, HttpStatusCode, HttpStatusMessages,
  OpraURL, OpraURLPath,
} from '@opra/common';
import { HttpAdapterHost } from '../http-adapter-host.js';
import { HttpServerRequest } from '../http-server-request.js';
import { HttpServerResponse } from '../http-server-response.js';
import type { NodeHttpAdapter } from './node-http-adapter';

/**
 * @class NodeHttpAdapterHost
 */
export class NodeHttpAdapterHost extends HttpAdapterHost implements NodeHttpAdapter {
  protected _platform: string = 'http';
  protected _basePath: OpraURLPath;
  protected _server: http.Server;

  get basePath() {
    return this._basePath;
  }

  get server() {
    return this._server;
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

  protected async init(api: ApiDocument, options?: NodeHttpAdapter.Options) {
    await super.init(api, options);
    this._basePath = new OpraURLPath(options?.basePath);
    this._server = http.createServer(
        (incomingMessage: http.IncomingMessage, serverResponse: http.ServerResponse) =>
            this._serverListener(incomingMessage, serverResponse));
  }

  protected _serverListener(incomingMessage: http.IncomingMessage, serverResponse: http.ServerResponse) {
    const originalUrl = incomingMessage.url;
    const parsedUrl = new OpraURL(originalUrl);
    const relativePath = OpraURLPath.relative(parsedUrl.path, this.basePath);
    if (!relativePath) {
      serverResponse.statusCode = HttpStatusCode.NOT_FOUND;
      serverResponse.statusMessage = HttpStatusMessages[HttpStatusCode.NOT_FOUND];
      serverResponse.end();
      return;
    }
    parsedUrl.path = relativePath;
    (incomingMessage as any).originalUrl = originalUrl;
    (incomingMessage as any).baseUrl = this.basePath.toString();
    (incomingMessage as any).parsedUrl = parsedUrl;
    Object.defineProperty(incomingMessage, 'searchParams', {
      get(): any {
        return (incomingMessage as any).parsedUrl.searchParams;
      }
    })
    const req = HttpServerRequest.from(incomingMessage);
    const res = HttpServerResponse.from(serverResponse);
    this.handleHttp(req, res)
        .catch((e) => this._logger.fatal(e));
  }


  static async create(api: ApiDocument, options?: NodeHttpAdapter.Options): Promise<NodeHttpAdapter> {
    const adapter = new NodeHttpAdapterHost();
    await adapter.init(api, options);
    return adapter;
  }

}

