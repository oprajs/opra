import type { Application, Request, Response } from 'express';
import { ApiDocument, OpraURLPath } from '@opra/common';
import type { ExpressAdapter } from './express-adapter.js';
import { HttpAdapterBase } from './http-adapter-base.js';
import { HttpServerRequest } from './http-server-request.js';
import { HttpServerResponse } from './http-server-response.js';

export class ExpressAdapterHost extends HttpAdapterBase implements ExpressAdapter {
  _platform = 'express';
  _options: ExpressAdapter.Options;
  _app: Application;

  constructor(app: Application, api: ApiDocument, options?: ExpressAdapter.Options) {
    super(api, options);
    const basePath = new OpraURLPath(options?.basePath);
    app.use(basePath.toString(), (_req: Request, _res: Response) => {
      const req = HttpServerRequest.from(_req);
      const res = HttpServerResponse.from(_res);
      this.handleIncoming(req, res)
          .catch(() => void 0);
    });
  }

  get app() {
    return this._app;
  }

}
