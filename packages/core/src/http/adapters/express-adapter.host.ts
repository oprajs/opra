import type { Application, Request, Response } from 'express';
import { ApiDocument, OpraURLPath } from '@opra/common';
import { HttpAdapterHost } from '../http-adapter-host.js';
import { HttpServerRequest } from '../http-server-request.js';
import { HttpServerResponse } from '../http-server-response.js';
import type { ExpressAdapter } from './express-adapter.js';

export class ExpressAdapterHost extends HttpAdapterHost implements ExpressAdapter {
  protected _platform: string = 'express';
  protected _app: Application;

  constructor(app: Application) {
    super();
    this._app = app;
  }

  get app() {
    return this._app;
  }

  protected async init(api: ApiDocument, options?: ExpressAdapter.Options) {
    const basePath = new OpraURLPath(options?.basePath);
    this._app.use(basePath.toString(), (_req: Request, _res: Response) => {
      const req = HttpServerRequest.from(_req);
      const res = HttpServerResponse.from(_res);
      this.handleHttp(req, res)
          .catch((e) => this._logger.fatal(e));
    });
  }

  static async create(app: Application, api: ApiDocument, options?: ExpressAdapter.Options): Promise<ExpressAdapter> {
    const adapter = new ExpressAdapterHost(app);
    await adapter.init(api, options);
    return adapter;
  }

}
